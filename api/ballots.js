const { Router } = require('express')
const moment = require('moment-timezone')
const Joi = require('@hapi/joi');
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

  if (isBetween || process.env.NODE_ENV === 'development' || process.env.HEROKU_ENVIRONMENT === 'alpha-development') {
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
      if (snapshot.empty) throw new Error('No Ballot found today')
      else {
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
  userId: Joi.string().min(1).required(),
  response: Joi.object({

  }),
})

router.post('/today/:ballot_id', validateTimeAndCache, async (req, res, next) => {
  try {
    const ballotId = req.params.ballot_id
    if (!req.ballot || req.ballot.id !== ballotId) throw new Error('Illegal ballot submission')

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

const getBallotResults = async (ballotId, requestorId) => {
  const doc = await db.collection('ballots').doc(ballotId).get()
  if(!doc.exists) throw new Error('Invalid ballot_id provided')

  const ballot = doc.data()

  if (!ballot.processed) throw new Error('Ballot has not been processed yet')

  const res = {
    date: ballot.date,
    id: ballot.id,
    questions: ballot.questions,
    aggregate: ballot.results.aggregate,
    winningAnswers: ballot.results.winningAnswers,
    userPoints: null,
    response: null,
  }

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
    if (!ballotId) throw new Error('No latest results to show')

    const response = await getBallotResults(ballotId, req.uid)

    res.status(200).json(response)
  } catch (err) {
    next(err)
  }
})

router.get('/:ballot_id/results', async (req, res, next) => {
  try {
    const ballotId = req.params.ballot_id
    const response = await getBallotResults(ballotId, req.uid)

    res.status(200).json(response)
  } catch (err) {
    next(err)
  }
})

module.exports = router
