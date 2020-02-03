const { Router } = require('express')

const router = Router()

router.use('/ballots', require('./ballot'))

module.exports = router
