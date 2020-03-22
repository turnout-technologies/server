const { Router } = require('express')
const { Expo } = require('expo-server-sdk')
const Joi = require('@hapi/joi');
const moment = require('moment')
const db = require('../db')

const router = Router()
const userSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  pushToken: Joi.string().allow('').required(),
  avatarURL: Joi.string().uri().allow('').required(),
})

router.get('/leaderboard', async (req, res, next) => {
  try {
    // Request Query defaults to string
    const snapshot = await db.collection('users').orderBy('points', 'desc').limit(parseInt(req.query.limit) || 100).get()
    if (snapshot.empty) return res.status(200).json({ leaderboard: [] })
    const users = []
    // Grab the doc in data form
    snapshot.forEach(doc => {
      let user = doc.data()
      users.push({
        id: user.id,
        name: user.name,
        avatarURL: user.avatarURL,
        points: user.points,
      })
    })

    if (users.find(user => user.id === req.uid)) res.status(200).json({
      leaderboard: users
    })
    else {
      const doc = await db.collection('users').doc(req.uid).get()
      const self = doc.data()

      res.status(200).json({
        leaderboard: users,
        self: {
          id: self.id,
          name: self.name,
          avatarURL: self.avatarURL,
          points: self.points,
        }
      })
    }
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, email, pushToken, avatarURL } = req.body
    await userSchema.validateAsync({ name, email, pushToken, avatarURL });
    const newUser = {
      id: req.uid,
      createdAt: moment().unix(),
      points: 0,
      name,
      email,
      pushToken: pushToken ? pushToken : '',
      avatarURL,
    }
    await db.collection('users').doc(newUser.id).set(newUser)
    res.status(201).json(newUser)
  } catch (err) {
    next(err)
  }

})

router.get('/self', async (req, res, next) => {
  try {
    const doc = await db.collection('users').doc(req.uid).get()

    if (!doc.exists) throw new Error(`User not found with id ${req.uid}`)

    res.status(200).json(doc.data())
  } catch (err) {
    next(err)
  }
})


const tokenSchema = Joi.object({
  pushToken: Joi.string().allow('').required()
})

router.put('/self/push-token', async (req, res, next) => {
  try {
    await tokenSchema.validateAsync(req.body)
    const { pushToken } = req.body
    // Check that all your push tokens appear to be valid Expo push tokens
    if (pushToken && !Expo.isExpoPushToken(pushToken)) {
      const err = new Error(`Push token ${pushToken} is not a valid Expo push token`)
      err.status = 400
      throw err
    }

    const doc = await db.collection('users').doc(req.uid).update({
      pushToken
    })

    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
