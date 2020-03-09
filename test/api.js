const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const chai = require('chai'),
      chaitHttp = require('chai-http')
const app = require('../app')
chai.use(chaitHttp)
const expect = chai.expect
const should = chai.should()

// const firebase = require("firebase")
// const firebaseConfig = {
//   apiKey: "AIzaSyBEzZc3rKm6MkbXhhVdXNTdYp1oAfFi0p0",
//   authDomain: "turnout-dd144.firebaseapp.com",
//   databaseURL: "https://turnout-dd144.firebaseio.com",
//   projectId: "turnout-dd144",
//   storageBucket: "turnout-dd144.appspot.com",
//   messagingSenderId: "941973159819",
//   appId: "1:941973159819:web:f49bf4bc3dcc95d362398e",
//   measurementId: "G-HJ8NZWJJE3"
// }
// firebase.initializeApp(firebaseConfig)

describe('API Middleware', function () {
  describe('Authorization Header Error Validation', function() {
    it('should reject missing "Authorization" header', async function() {
      const res = await chai.request(app).get('/v1')
      expect(res).to.have.status(401)
      expect(res.unauthorized).to.equal(true)
      expect(res.text).to.eql('Invalid Authorization Header')
    })

    it('should reject invalid "Authorization" header', async function() {
      const res = await chai.request(app).get('/v1').set('Authorization', `Bearer <something>`)
      expect(res).to.have.status(401)
      expect(res.unauthorized).to.equal(true)
      expect(res.text).to.eql('Invalid Authorization Token')
    })
  })
})
