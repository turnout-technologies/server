const { Router } = require('express')

const router = Router()

router.use('/ballots', require('./ballot'))

// Expect
router.post('/hello', (req, res, next) => {

})

module.exports = router
