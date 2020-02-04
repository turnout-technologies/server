const { Router } = require('express')
const moment = require('moment')
const db = require('../db')

const router = Router()

router.get('/today', async (req, res, next) => {
  try {
    if (moment().unix() < moment(1359932400)) res.status(200).send('Too early')
    else {
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
    }
  } catch (err) {
    next(err)
  }

})

module.exports = router
