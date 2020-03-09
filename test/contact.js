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
    it('Type: happy', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'happy',
        message: 'This is great!',
        filename: ''
      })
      expect(res).to.have.status(201)
    })

    it('Type: sad', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'sad',
        message: 'This is bad!',
        filename: ''
      })
      expect(res).to.have.status(201)
    })

    it('Type: bug', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'bug',
        message: 'This is broken!',
        filename: ''
      })
      expect(res).to.have.status(201)
    })

    it('Type: suggestion w/ filename', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'suggestion',
        message: 'This should be this!',
        filename: 'moohab.png'
      })
      expect(res).to.have.status(201)
    })

    it('Type: question_idea w/ filename', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'question_idea',
        message: 'This should be a question!',
        filename: 'moohab.jpg'
      })
      expect(res).to.have.status(201)
    })
  })

  describe('it should not accept invalid POST /contact', function() {
    it('missing property filename', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'happy',
        message: 'This is great!'
      })
      expect(res).to.have.status(400)
    })
    it('empty message', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'happy',
        message: '',
        filename: ''
      })
      expect(res).to.have.status(400)
    })
    it('wrong type enum', async function() {
      const res = await chai.request(app).post('/v1/contact').set('Authorization', `Bearer ${this.token}`).send({
        type: 'something',
        message: 'This is great!',
        filename: ''
      })
      expect(res).to.have.status(400)
    })
  })
})
