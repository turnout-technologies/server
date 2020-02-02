// require('dotenv').config()

const express = require('express')
const path = require('path')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')

let serviceAccount = require('./config/serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

let db = admin.firestore()

const app = express()

app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())

// API routes
app.use('/api/v1', require('./api'))

// Error handling endware
app.use((err, req, res, next) => {
  console.error(err.message, err)
  res.status(err.status || 500).send(err.message || 'Internal server error.')
})

app.listen(8000, () => {
  console.log('Server started at port 8000')
})
