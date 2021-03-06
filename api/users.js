const { Router } = require('express')
const { Expo } = require('expo-server-sdk')
const Joi = require('@hapi/joi')
const moment = require('moment')
const db = require('../db')

const referralLevels = [1,3,5,10,20,35,50,75,100]
const referralUpcomingLevels = referralLevels.map(e => e - 1)

const router = Router()
const userSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  pushToken: Joi.string().allow(''),
  avatarURL: Joi.string().uri().allow('').allow(null).required(),
  referringUserId: Joi.string().allow(''),
})

// let cache = {}
// // Clear cache every 30 minutes
// setInterval(() => {
//   cache = {}
// }, 1800000)
router.get('/leaderboard', async (req, res, next) => {
  try {
    // default to total if a query is not provided
    let { sort = 'total' } = req.query
    let leaderboard = []
    // if (cache[sort]) leaderboard = cache[sort]
    // else {
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
    //   // cache the leaderboard for today
    //   cache[sort] = leaderboard
    // }

    // Get the dropId
    // let dropId
    // if (cache.dropId) dropId = cache.dropId
    // else {
      const doc = await db.collection('drops').doc('live').get()

      const drop = doc.data()
      dropId = drop.id
    //   cache.dropId = dropId
    // }

    res.status(200).json({
      dropId,
      leaderboard,
    })
  } catch (err) {
    next(err)
  }
})

async function addReferral(referringUserId) {
  const userRef = db.collection('users').doc(referringUserId)
  // Run a transaction to guarantee acidity - read must come before write
  try {
    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef)

      if (!userDoc.exists) throw new Error('Referring User ID Not Found.')
      const user = userDoc.data()

      const referralBonus = {
        'referrals.valid': user.referrals.valid + 1,
      }

      // If number is going to hit a certain level 1,5,10,20 (1 behind)
      if (referralUpcomingLevels.includes(user.referrals.valid)) referralBonus['powerups.autocorrects'] = user.powerups.autocorrects + 1

      t.update(userRef, referralBonus)
    })

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
      avatarURL: avatarURL ? avatarURL : '',
      referrals: {
        valid: 0,
        referringUserId
      },
      powerups: {
        autocorrects: bonus
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

    const user = doc.data()

    // Determine how many left until next referral level is hit
    const { valid } = user.referrals
    for(level of referralLevels) {
      if (valid < level) {
        user.referrals.nextLevel = level
        break
      }
    }

    res.status(200).json(user)
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
