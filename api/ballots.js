const { Router } = require('express')
const moment = require('moment-timezone')
const db = require('../db')

const router = Router()
const est = 'America/New_York'
let ballotCache;

router.use((req, res, next) => {
  //set the start and end times for today EST
  const start = moment.tz(est).format("YYYY-MM-DD") + " 18:00"
  const end = moment.tz(est).format("YYYY-MM-DD") + " 22:00"

  //convert the times to moments so we can do a compare
  const startMoment = moment.tz(start, est)
  const endMoment = moment.tz(end, est)

  const isBetween = moment.tz(est).isBetween(startMoment, endMoment)

  if (isBetween || process.env.NODE_ENV === 'development') {
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
})

router.get('/today', async (req, res, next) => {
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

router.post('/today/:ballot_id', async (req, res, next) => {
  try {
    const ballotId = req.params.ballot_id
    if (!req.ballot || req.ballot.id !== ballotId) throw new Error('Ilegal ballot submission')

    const response = {
      ...req.body.response,
      userId: req.body.userId,
    }

    await db.collection('ballots').doc(ballotId).collection('responses').doc(req.body.userId).set(response)
    res.status(201).send('Response successfully submitted')
  } catch (err) {
    next(err)
  }
})

router.get('/:ballot_id/results', async (req, res, next) => {
  try {
    const ballotId = req.params.ballot_id

    const doc = await db.collection('ballots').doc(ballotId).get()
    if(!doc.exists) throw new Error('Invalid ballot_id provided')

    const ballot = doc.data()

    if (!ballot.processed) throw new Error('Ballot has not been processed yet')

    const response = {
      date: ballot.date,
      questions: ballot.questions,
      aggregate: ballot.results.aggregate,
    }

    const requestor = req.query.requestor
    if (requestor) {
      const responseDoc = await db.collection('ballots').doc(ballotId).collection('responses').doc(requestor).get()
      let ballotResponse = null
      if(responseDoc.exists) ballotResponse = responseDoc.data()
      response.response = ballotResponse
    }

    res.status(200).json(response)
  } catch (err) {
    next(err)
  }
})

module.exports = router
