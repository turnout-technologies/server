const { Router } = require('express')
const admin = require('../firebase')

const router = Router()

router.use('/ballots', require('./ballot'))

// Expecting token on req.body
router.post('/hello', async (req, res, next) => {
  try {
    let decodedToken = await admin.auth().verifyIdToken(req.body.token)
    res.status(200).send(decodedToken.uid)
  } catch (err) {
    next(err)
  }
})

module.exports = router
