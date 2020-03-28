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

describe('Contact API', function () {
  this.timeout(5000)
  this.retries(1)
  this.slow(1000)

  before(async function() {
    this.firebaseApp = await firebase.initializeApp(firebaseConfig)
    await this.firebaseApp.auth().signInWithEmailAndPassword(FIREBASE_TEST_EMAIL,FIREBASE_TEST_PASSWORD)
    this.token = await this.firebaseApp.auth().currentUser.getIdToken()
  })

  after(function() {
    this.firebaseApp.auth().signOut()
    this.firebaseApp.delete()
  })

  describe('it should accept valid POST /contact', function() {
    xit('Type: happy', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'happy',
        message: 'This is great!',
        filename: ''
      })
      expect(res).to.have.status(201)
    })

    xit('Type: sad w/ name', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'sad',
        message: 'This is bad!',
        filename: '',
        name: 'test'
      })
      expect(res).to.have.status(201)
    })

    xit('Type: bug w/ name and email', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'bug',
        message: 'This is broken!',
        filename: '',
        name: 'Test User',
        email: 'test@test.com'
      })
      expect(res).to.have.status(201)
    })

    xit('Type: suggestion w/ filename and email', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'suggestion',
        message: 'This should be this!',
        filename: 'moohab.png',
        email: 'test@test.com'
      })
      expect(res).to.have.status(201)
    })

    xit('Type: question_idea w/ filename', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'question_idea',
        message: 'This should be a question!',
        filename: 'moohab.jpg'
      })
      expect(res).to.have.status(201)
    })
  })

  describe('it should not accept invalid POST /contact', function() {
    xit('missing property: filename', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'happy',
        message: 'This is great!'
      })
      expect(res).to.have.status(400)
    })
    xit('empty message', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'happy',
        message: '',
        filename: ''
      })
      expect(res).to.have.status(400)
    })
    xit('wrong type enum', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'something',
        message: 'This is great!',
        filename: ''
      })
      expect(res).to.have.status(400)
    })
    xit('superfluous field', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'question_idea',
        message: 'This should be another question!',
        filename: 'moohab1.jpg',
        extra: 'something'
      })
      expect(res).to.have.status(400)
    })
  })
})
