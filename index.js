const { NODE_ENV } = process.env
if (NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const path = require('path')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')

const app = express()

app.use(NODE_ENV === 'production' ? morgan('combined') : morgan('dev'))
if (NODE_ENV === 'production') {
  // Force HTTPS in production
  app.use((req, res, next) => {
    // Heroku forwards original protocol request header
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(403).send({ message: 'SSL required' })
    }
    // allow the request to continue
    next()
  })
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())

// API routes
app.use('/v1', require('./api'))

app.listen(process.env.PORT || 8000, () => {
  console.log('Server started at port 8000')
})
