// require('dotenv').config()

const express = require('express')
const path = require('path')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')
// const mongoose = require('mongoose')

// mongoose.connect(process.env.DB_CRED, {useNewUrlParser: true})
// const db = mongoose.connection
// db.on('error', console.error.bind(console, 'connection error:'))
// db.once('open', function() {
//   console.log('MongoDB database connected successfully')
// })

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
