const { Router } = require('express')
const moment = require('moment-timezone')
const db = require('../db')

const router = Router()

router.use((req, res, next) => {
  //set the start and end times for today EST
  const start = moment.tz("America/New_York").format("YYYY-MM-DD") + " 18:00"
  const end = moment.tz("America/New_York").format("YYYY-MM-DD") + " 22:00"

  //convert the times to moments so we can do a compare
  const startMoment = moment.tz(start, "America/New_York")
  const endMoment = moment.tz(end, "America/New_York")

  const isBetween = moment.tz("America/New_York").isBetween(startMoment, endMoment)

  if (isBetween || process.env.NODE_ENV === 'development') {
    next()
  } else {
    const err = new Error('Ballot is not open')
    err.status = 403
    next(err)
  }
})

router.get('/today', async (req, res, next) => {
  try {
    const targetDate = moment.tz(moment.tz("America/New_York").format("YYYY-MM-DD") + " 18:00", "America/New_York")

    const snapshot = await db.collection('ballots').where('date', '==', targetDate.unix()).get()
    if (snapshot.empty) res.status(500).send('Not Found')
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

      res.json(ballot)
    }
  } catch (err) {
    next(err)
  }

})

module.exports = router
