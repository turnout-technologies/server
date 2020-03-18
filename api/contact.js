const { Router } = require('express')
const uuid = require('uuid/v1')
const Joi = require('@hapi/joi');
const moment = require('moment')

const db = require('../db')

const router = Router()
const contactSchema = Joi.object({
  type: Joi.string().valid('bug', 'happy', 'sad', 'suggestion', 'question_idea').required(),
  message: Joi.string().min(1).required(),
  filename: Joi.string().allow('').required(),
  name: Joi.string(),
  email: Joi.string()
})

router.post('/', async (req, res, next) => {
  try {
    await contactSchema.validateAsync(req.body)
    const { type, message, filename, name, email } = req.body
    const docId = uuid()

    await db.collection('contact').doc(docId).create({
      type,
      message,
      filename,
      name: name ? name : '',
      email: email ? email : '',
      uid: req.uid,
      createdAt: moment().unix(),
    })

    res.status(201).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
