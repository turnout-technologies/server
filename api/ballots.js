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
      if (snapshot.empty) res.status(500).json({
        error_name: 'NoBallotFound',
        error_description: 'There was no matching ballot with today\'s date'
      })
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
    console.log(req.ballot)
    if (!req.ballot || req.ballot.id !== ballotId) throw new Error('Ilegal ballot submission')
    const response = await db.collection('ballots').doc(ballotId).collection('responses').doc(req.body.userId).set(req.body.response)
    res.status(201).send('Response successfully submitted')
  } catch (err) {
    next(err)
  }
})

module.exports = router
