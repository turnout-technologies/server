const { Router } = require('express')
const uuid = require('uuid/v1')
const Joi = require('@hapi/joi');
const moment = require('moment')

const db = require('../db')


const router = Router()
const contactSchema = Joi.object({
  type: Joi.string().valid('bug', 'happy', 'sad', 'suggestion', 'question_idea').required(),
  message: Joi.string().min(1).required()
})

router.post('/', async (req, res, next) => {
  try {
    const { type, message } = req.body
    await contactSchema.validateAsync({ type, message });
    const docId = uuid()

    await db.collection('contact').doc(docId).create({
      type,
      message,
      uid: req.uid,
      createdAt: moment().unix(),
    })

    res.status(201).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
