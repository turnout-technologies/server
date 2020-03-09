const express = require('express')
const path = require('path')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')

const app = express()
switch(process.env.NODE_ENV) {
  case 'production':
    app.use(morgan('combined'))
    // Force HTTPS in production
    app.use((req, res, next) => {
      // Heroku forwards original protocol request header
      if (req.headers['x-forwarded-proto'] !== 'https') {
          return res.status(403).send({ message: 'SSL required' })
      }
      // allow the request to continue
      next()
    })
    break

  case 'test':
    break

  default:
    app.use(morgan('dev'))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())

// API routes
app.use('/v1', require('./api'))

module.exports = app
