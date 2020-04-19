const { Router } = require('express')
const moment = require('moment-timezone')
const Joi = require('@hapi/joi');
const increment = require('firebase-admin').firestore.FieldValue.increment
const db = require('../db')

const router = Router()
const est = 'America/New_York'
let ballotCache;

const validateTimeAndCache = (req, res, next) => {
  //set the start and end times for today EST
  const start = moment.tz(est).format("YYYY-MM-DD") + " 18:00"
  const end = moment.tz(est).format("YYYY-MM-DD") + " 22:00"

  //convert the times to moments so we can do a compare
  const startMoment = moment.tz(start, est)
  const endMoment = moment.tz(end, est)

  const isBetween = moment.tz(est).isBetween(startMoment, endMoment)

  if (isBetween || process.env.NODE_ENV === 'development' || process.env.HEROKU_ENVIRONMENT === 'alpha') {
    // If ballotCache exists AND it is matched with current date, return cache
    if (ballotCache && moment.tz(moment.unix(ballotCache.date), est).isSame(startMoment)) {
      req.ballot = ballotCache
    }
    next()
  } else {
    const err = new Error('Ballot is not open')
    err.status = 403
    next(err)
  }
}

router.get('/today', validateTimeAndCache, async (req, res, next) => {
  try {
    // If a cached version is available return that one
    if (req.ballot) res.status(200).json(ballotCache)
    else {
      const targetDate = moment.tz(moment.tz(est).format("YYYY-MM-DD") + " 18:00", est)
      const snapshot = await db.collection('ballots').where('date', '==', targetDate.unix()).get()
      if (snapshot.empty) {
        console.warn('No ballot today!')
        return res.status(200).end()
      } else {
        const docs = [];
        // Grab the doc in data form
        snapshot.forEach(doc => {
          docs.push(doc.data())
        })

        if (docs.length !== 1) throw new Error('Multiple Live Ballots')

        const data = docs[0]
        const ballot = {
          id: data.id,
          createdAt: data.createdAt,
          date: data.date,
          questions: data.questions,
        }

        ballotCache = ballot

        res.status(200).json(ballot)
      }
    }
  } catch (err) {
    next(err)
  }
})

const responseSchema = Joi.object({
  response: Joi.object(),
})

router.post('/today/:ballot_id', validateTimeAndCache, async (req, res, next) => {
  try {
    const ballotId = req.params.ballot_id
    if (!req.ballot || req.ballot.id !== ballotId) {
      const err = new Error('Illegal ballot submission')
      err.status = 400
      throw err
    }

    const response = {
      ...req.body.response,
      userId: req.uid,
    }

    await db.collection('ballots').doc(ballotId).collection('responses').doc(req.uid).set(response)
    res.status(201).send('Response successfully submitted')
  } catch (err) {
    next(err)
  }
})

const resultsCache = {}

const getBallotResults = async (ballotId, requestorId) => {
  let ballot

  if (resultsCache[ballotId]) ballot = resultsCache[ballotId]
  else {
    const doc = await db.collection('ballots').doc(ballotId).get()
    if(!doc.exists) throw new Error('Invalid ballot_id provided')

    ballot = doc.data()

    if (!ballot.processed) throw new Error('Ballot has not been processed yet')
    resultsCache[ballotId] = ballot
  }

  const res = {
    date: ballot.date,
    id: ballot.id,
    questions: ballot.questions,
    aggregate: ballot.results.aggregate,
    winningAnswers: ballot.results.winningAnswers,
    userPoints: null,
    response: null,
  }

  // Add user response information
  const responseDoc = await db.collection('ballots').doc(ballotId).collection('responses').doc(requestorId).get()

  if (responseDoc.exists) {
    res.response = responseDoc.data()
    res.userPoints = ballot.results.userPoints[requestorId]
  }

  return res
}

router.get('/latest/results', async (req, res, next) => {
  try {
    const doc = await db.collection('meta').doc('ballot').get()
    if (!doc.exists) throw new Error('Ballot meta is not defined')

    const meta = doc.data()

    const ballotId = meta.latestProcessedBallotId
    if (!ballotId) {
      console.error('No latest results to show')
      return res.status(200).end()
    }

    const ballotResults = await getBallotResults(ballotId, req.uid)

    res.status(200).json(ballotResults)
  } catch (err) {
    next(err)
  }
})

router.get('/:ballot_id/results', async (req, res, next) => {
  try {
    const ballotId = req.params.ballot_id
    const ballotResults = await getBallotResults(ballotId, req.uid)

    res.status(200).json(ballotResults)
  } catch (err) {
    next(err)
  }
})

// Autocorrect
router.put('/latest/results/self', async (req, res, next) => {
  try {
    const doc = await db.collection('meta').doc('ballot').get()
    if (!doc.exists) throw new Error('Ballot meta is not defined')

    const meta = doc.data()

    const ballotId = meta.latestProcessedBallotId

    const ballotResults = await getBallotResults(ballotId, req.uid)
    const { userPoints, response } = ballotResults

    // Add autocorrect field if response exists
    if (!response || !userPoints) throw new Error('User does not have a response for this ballot')

    const { questionId, pointsToAdd, dropId } = req.body

    // Update response object to mark question as autocorrected and increment bonus points from that response
    const ballotResponseRef = await db.collection('ballots').doc(ballotId).collection('responses').doc(req.uid)
    const ballotResponseUpdate = {
      'autocorrect.bonus': increment(pointsToAdd),
    }

    // If the questionIds is not an array yet, create one
    if (!response.autocorrect || !response.autocorrect.questionIds) ballotResponseUpdate['autocorrect.questionIds'] = [questionId]
    else ballotResponseUpdate['autocorrect.questionIds'] = [...response.autocorrect.questionIds, questionId]

    await ballotResponseRef.update(ballotResponseUpdate)
    // Replace updated ballot response object on ballotResults
    const ballotResponseDoc = await ballotResponseRef.get()
    ballotResults.response = ballotResponseDoc.data()

    // Update user points and remove a hack
    const userUpdate = {
      'powerups.autocorrects': increment(-1),
      'points.total': increment(pointsToAdd)
    }

    userUpdate[`points.${dropId}`] = increment(pointsToAdd)
    await db.collection('users').doc(req.uid).update(userUpdate)

    res.status(200).json(ballotResults)
  } catch (err) {
    next(err)
  }
})

module.exports = router
