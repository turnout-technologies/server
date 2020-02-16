const { Router } = require('express')
const moment = require('moment')
const db = require('../db')
const User = require('../db/models/user')

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const newUser = new User({
      ...req.body,
      id: req.uid
    })
    await db.collection('users').doc(newUser.id).set(newUser.json())
    res.status(201).json(newUser.json())
  } catch (err) {
    next(err)
  }

})

module.exports = router
