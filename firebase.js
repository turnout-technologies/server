const admin = require('firebase-admin')

let serviceAccount = require('./config/serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

module.exports = admin
