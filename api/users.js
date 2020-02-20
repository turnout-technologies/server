const { Router } = require('express')
const db = require('../db')
const User = require('../db/models/user')

const router = Router()

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
