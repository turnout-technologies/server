const { Router } = require('express')
const { Expo } = require('expo-server-sdk')
const Joi = require('@hapi/joi');
const moment = require('moment')
const db = require('../db')

const router = Router()
const userSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  pushToken: Joi.string(),
  avatarURL: Joi.string().uri(),
})

router.get('/leaderboard', async (req, res, next) => {
  try {
    // Request Query defaults to string
    const snapshot = await db.collection('users').orderBy('points', 'desc').limit(parseInt(req.query.limit) || 100).get()
    if (snapshot.empty) res.status(200).json({ leaderboard: [] })
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

router.get('/:id', async (req, res, next) => {
  try {
    // If the requestor is not the same as the user to be edited
    if (req.params.id !== req.uid) {
      const error = new Error('Unauthorized User Request')
      error.status = 401
      throw error
    }

    const doc = await db.collection('users').doc(req.uid).get()

    res.status(200).json(doc.data())
  } catch (err) {
    next(err)
  }
})


router.put('/:id/push-token', async (req, res, next) => {
  try {
    // If the requestor is not the same as the user to be edited
    if (req.params.id !== req.uid) {
      const error = new Error('Unauthorized User Request')
      error.status = 401
      throw error
    }

    const { pushToken } = req.body
    // Check that all your push tokens appear to be valid Expo push tokens
    if (pushToken && !Expo.isExpoPushToken(pushToken)) {
      throw new Error(`Push token ${pushToken} is not a valid Expo push token`)
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
