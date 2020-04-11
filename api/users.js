const { Router } = require('express')
const { Expo } = require('expo-server-sdk')
const Joi = require('@hapi/joi')
const moment = require('moment')
const increment = require('firebase-admin').firestore.FieldValue.increment
const db = require('../db')

const router = Router()
const userSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  pushToken: Joi.string().allow(''),
  avatarURL: Joi.string().uri().allow('').required(),
  referringUserId: Joi.string().allow(''),
})

const cache = {}
router.get('/leaderboard', async (req, res, next) => {
  try {
    // default to total if a query is not provided
    let { sort = 'total' } = req.query
    const today = moment().format('MM/DD')
    let leaderboard = []
    if (cache[sort] && cache[sort][today]) leaderboard = cache[sort][today]
    else {
      const snapshot = await db.collection('users').orderBy(`points.${sort}`, 'desc').limit(100).get()
      if (snapshot.empty) return res.status(200).json({ leaderboard })
      // Grab the doc in data form
      snapshot.forEach(doc => {
        let user = doc.data()
        leaderboard.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarURL: user.avatarURL,
          points: user.points,
        })
      })
      // cache the leaderboard for today
      if (!cache[sort]) cache[sort] = {}
      cache[sort][today] = leaderboard
    }

    res.status(200).json({
      leaderboard,
    })
  } catch (err) {
    next(err)
  }
})

const referralBonus = {
  'referrals.valid': increment(1),
  'powerups.hacks': increment(1)
}

async function addReferral(referringUserId) {
  const userRef = db.collection('users').doc(referringUserId)
  const userDoc = await userRef.get()
  if (!userDoc.exists) throw new Error('Referring User ID Not Found.')

  // Add one to referrals and power ups
  try {
    await userRef.update(referralBonus)
    return true
  } catch (err) {
    return false
  }
}

router.post('/', async (req, res, next) => {
  try {
    await userSchema.validateAsync(req.body)
    const { firstName, lastName, email, pushToken, avatarURL, referringUserId } = req.body

    let bonus = !!referringUserId && await addReferral(referringUserId) ? 1 : 0

    const newUser = {
      id: req.uid,
      createdAt: moment().unix(),
      points: {
        total: 0
      },
      firstName,
      lastName,
      email,
      pushToken: pushToken ? pushToken : '',
      avatarURL,
      referrals: {
        valid: bonus
      },
      powerups: {
        hacks: bonus
      },
      turbovote: ''
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

router.put('/self/turbovote', async (req, res, next) => {
  try {
    // Check that all your push tokens appear to be valid Expo push tokens
    await db.collection('users').doc(req.uid).update({
      turbovote: moment().unix()
    })

    res.status(200).end()
  } catch (err) {
    next(err)
  }
})


module.exports = router
