const { Router } = require('express')
const admin = require('../firebase')

const router = Router()

// Validate request token. If validation fails, gets passed onto error handling endware
router.use(async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
      const err = new Error('Invalid Authorization Header')
      err.status = 401
      throw err
    }

    const token = authHeader.replace('Bearer', '').trim()
    req.decodedToken = await admin.auth().verifyIdToken(token)
    req.token = token
    next()
  } catch (err) {
    next(err)
  }
})

router.use('/users', require('./users'))
router.use('/ballots', require('./ballots'))

// Error handling endware
router.use((err, req, res, next) => {
  console.error(err.message, err)
  res.status(err.status || 500).send(err.message || 'Internal server error.')
})

module.exports = router
