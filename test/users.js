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

describe('Users API', function () {
  before(async function() {
    this.firebaseApp = await firebase.initializeApp(firebaseConfig)
    await this.firebaseApp.auth().signInWithEmailAndPassword(FIREBASE_TEST_EMAIL,FIREBASE_TEST_PASSWORD)
    this.token = await this.firebaseApp.auth().currentUser.getIdToken()
    // token maps to this id vh7ndBp1A4XWcTYCu8lZIbqMwTg2
  })

  after(function() {
    this.firebaseApp.auth().signOut()
    this.firebaseApp.delete()
  })

  describe('POST /users', function() {
    describe('it should accept valid inputs', function() {
      it('w/ avatarURL & pushToken', async function() {
        const res = await chai.request(app).post('/v1/users').set('Authorization', `Bearer ${this.token}`).send({
          name: 'george lopez',
          email: 'test@test.com',
          avatarURL: 'https://www.google.com',
          pushToken: 'ExponentPushToken[g5sIEb0m2yFdzn5VdSSy9n]'
        })
        expect(res).to.have.status(201)
      })
      it('w/ avatarURL === \'\' & pushToken === \'\'', async function() {
        const res = await chai.request(app).post('/v1/users').set('Authorization', `Bearer ${this.token}`).send({
          name: 'george lopez',
          email: 'test@test.com',
          avatarURL: '',
          pushToken: ''
        })
        expect(res).to.have.status(201)
      })
    })
    describe('it should not accept invalid inputs', function() {
      it('missing fields: avatarURL', async function() {
        const res = await chai.request(app).post('/v1/users').set('Authorization', `Bearer ${this.token}`).send({
          name: 'george lopez',
          email: 'test@test.com',
          pushToken: ''
        })
        expect(res).to.have.status(400)
      })
      it('w/ invalid email', async function() {
        const res = await chai.request(app).post('/v1/users').set('Authorization', `Bearer ${this.token}`).send({
          name: 'george lopez',
          email: 'test@test',
          avatarURL: '',
          pushToken: ''
        })
        expect(res).to.have.status(400)
      })
      it('w/ invalid avatarURL', async function() {
        const res = await chai.request(app).post('/v1/users').set('Authorization', `Bearer ${this.token}`).send({
          name: 'george lopez',
          email: 'test@test.com',
          avatarURL: 'hi',
          pushToken: ''
        })
        expect(res).to.have.status(400)
      })
    })
  })

  describe('GET /users/self', function () {
    it('it should return valid response', async function() {
      const res = await chai.request(app).get('/v1/users/self').set('Authorization', `Bearer ${this.token}`)
      expect(res).to.have.status(200)
      const user = res.body
      expect(user).to.have.keys(['points', 'avatarURL', 'email', 'name', 'id', 'createdAt', 'pushToken'])
    })
  })

  describe('GET /users/leaderboard', function () {
    it('it should return valid response with no self', async function() {
      const res = await chai.request(app).get('/v1/users/leaderboard').set('Authorization', `Bearer ${this.token}`)
      expect(res).to.have.status(200)
      const { leaderboard, self } = res.body
      expect(leaderboard).to.be.an('array')
      expect(self).to.be.undefined
    })
    it('it should return valid response with query limit & self', async function() {
      const res = await chai.request(app).get('/v1/users/leaderboard').set('Authorization', `Bearer ${this.token}`).query({ limit: 1 })
      expect(res).to.have.status(200)
      const { leaderboard, self } = res.body
      expect(leaderboard).to.be.an('array')
      expect(leaderboard).to.have.lengthOf(1)
      expect(self).to.have.keys(['id', 'name', 'avatarURL', 'points'])
    })
  })

  describe('PUT /users/push-token', function() {
    describe('it should accept valid inputs', function() {
      it('enable push-token', async function() {
        const res = await chai.request(app).put('/v1/users/self/push-token').set('Authorization', `Bearer ${this.token}`).send({
          pushToken: 'ExponentPushToken[g5sIEb0m2yFdzn5VdSSy9n]'
        })
        expect(res).to.have.status(200)
      })
      it('disable push-token', async function() {
        const res = await chai.request(app).put('/v1/users/self/push-token').set('Authorization', `Bearer ${this.token}`).send({
          pushToken: ''
        })
        expect(res).to.have.status(200)
      })
    })
    describe('it should not accept invalid inputs', function() {
      it('missing fields: pushToken', async function() {
        const res = await chai.request(app).put('/v1/users/self/push-token').set('Authorization', `Bearer ${this.token}`).send({
          random: 'george lopez'
        })
        expect(res).to.have.status(400)
      })
      it('w/ invalid pushToken', async function() {
        const res = await chai.request(app).put('/v1/users/self/push-token').set('Authorization', `Bearer ${this.token}`).send({
          pushToken: 'something-weird'
        })
        expect(res).to.have.status(400)
      })
      it('w/ superfluous fields', async function() {
        const res = await chai.request(app).put('/v1/users/self/push-token').set('Authorization', `Bearer ${this.token}`).send({
          name: 'george lopez',
          pushToken: ''
        })
        expect(res).to.have.status(400)
      })
    })
  })

})
