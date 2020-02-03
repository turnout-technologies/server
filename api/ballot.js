const { Router } = require('express')
const db = require('../db')

const router = Router()

router.get('/today', async (req, res, next) => {
  try {
    const ballot = await db.collection('ballots').doc('test').get().data()
    res.json(ballot)
  } catch (err) {
    next(err)
  }

})

module.exports = router
