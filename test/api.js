const { CI } = process.env

if (!CI) {
  const dotenv = require('dotenv')
  const path = require('path')
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') })
}
const { FIREBASE_TEST_EMAIL, FIREBASE_TEST_PASSWORD } = process.env

const chai = require('chai'),
      chaitHttp = require('chai-http')
const app = require('../app')
chai.use(chaitHttp)
const expect = chai.expect
const should = chai.should()

const firebase = require("firebase")
const firebaseConfig = require('../config/testConfig')


describe('API Middleware', function () {
  this.timeout(5000)
  this.retries(1)
  this.slow(1000)

  describe('Authorization Header Error Validation', function() {
    it('should reject missing "Authorization" header', async function() {
      const res = await chai.request(app).get('/v1')
      expect(res).to.have.status(401)
      expect(res.unauthorized).to.equal(true)
      expect(res.text).to.eql('Invalid Authorization Header')
    })g

    it('should reject invalid "Authorization" header', async function() {
      const res = await chai.request(app).get('/v1').set('Authorization', `Bearer <something>`)
      expect(res).to.have.status(401)
      expect(res.unauthorized).to.equal(true)
      expect(res.text).to.eql('Invalid Authorization Token')
    })
  })

  describe('Firebase Authorization', function() {
    before(async function() {
      this.firebaseApp = await firebase.initializeApp(firebaseConfig)
      await this.firebaseApp.auth().signInWithEmailAndPassword(FIREBASE_TEST_EMAIL,FIREBASE_TEST_PASSWORD)
      this.token = await this.firebaseApp.auth().currentUser.getIdToken()
    })

    it('should accept valid "Authorization" token', async function() {
      const res = await chai.request(app).get('/v1').set('Authorization', `Bearer ${this.token}`)
      expect(res).to.have.status(200)
      expect(res.unauthorized).to.equal(false)
      expect(res.text).to.eql('Turnout 2020')
    })

    after(function() {
      this.firebaseApp.auth().signOut()
      this.firebaseApp.delete()
    })
  })
})
