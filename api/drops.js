const { Router } = require('express')
const db = require('../db')

const router = Router()

router.get('/live', async (req, res, next) => {
  try {
    const doc = await db.collection('drops').doc('live').get()

    if (!doc.exists) throw new Error('No Live Drop Found')

    drop = doc.data()

    res.status(200).json({ drop })
  } catch (err) {
    next(err)
  }
})

module.exports = router
