const { Router } = require('express')
const moment = require('moment-timezone')
const db = require('../db')

const router = Router()
const format = 'hh:mm:ss'

router.use((req, res, next) => {
  //set the start and end times for today EST
  const start = moment.tz("America/New_York").format("YYYY-MM-DD") + " 18:00";
  const end = moment.tz("America/New_York").format("YYYY-MM-DD") + " 22:00";

  //convert the times to moments so we can do a compare
  const startMoment = moment.tz(start, "America/New_York");
  const endMoment = moment.tz(end, "America/New_York");

  const isBetween = moment.tz("America/New_York").isBetween(startMoment, endMoment);

  if (isBetween) {
    next()
  } else {
    next(new Error('Ballot is not open'))
  }
})

router.get('/today', async (req, res, next) => {
  try {
    const snapshot = await db.collection('ballots').where('date', '==', 1359932400).get()
    // If the query has no results
    if (snapshot.empty) res.status(500).send('Not Found')
    else {
      // Grab the doc in data form
      let docs = []
      snapshot.forEach(doc => {
        docs.push(doc.data())
      })
      res.json(docs)
    }
  } catch (err) {
    next(err)
  }

})

module.exports = router
