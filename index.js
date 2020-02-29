const { NODE_ENV } = process.env
if (NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const path = require('path')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')

const app = express()

if (NODE_ENV === 'production') {
  const forceSsl = require('force-ssl-heroku')
  app.use(forceSsl)
}
app.use(NODE_ENV === 'production' ? morgan('combined') : morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())

// API routes
app.use('/v1', require('./api'))

app.listen(process.env.PORT || 8000, () => {
  console.log('Server started at port 8000')
})
