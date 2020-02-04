const { Router } = require('express')
const admin = require('../firebase')

const router = Router()

router.use('/users', require('./users'))
router.use('/ballots', require('./ballots'))

// Expecting token on req.body
router.get('/hello', async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer', '').trim()
    let decodedToken = await admin.auth().verifyIdToken(token)
    res.status(200).send(decodedToken.uid)
  } catch (err) {
    next(err)
  }
})

module.exports = router
