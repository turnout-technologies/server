const { Router } = require('express')
const admin = require('../firebase')
const logger = require('../utils/logger')

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
    .catch(() => {
      const err = new Error('Invalid Authorization Token')
      err.status = 401
      throw err
    })
    req.uid = req.decodedToken.uid
    req.token = token
    next()
  } catch (err) {

    next(err)
  }
})

router.get('/', (req, res, next) => {
  res.status(200).send('Turnout 2020')
})

router.use('/contact', require('./contact'))
router.use('/users', require('./users'))
router.use('/ballots', require('./ballots'))

// Error handling endware
router.use((err, req, res, next) => {
  switch (err.name) {
    case 'ValidationError': {
      err.status = 400
      break
    }
    default: {
      break
    }
  }
  if (!err.status) err.status = 500
  if (!err.message) err.message = 'Internal server error.'
  logger.error(err.message, err)
  res.status(err.status).send(err.message)
})

module.exports = router
