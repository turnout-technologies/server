const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const chai = require('chai'),
      chaitHttp = require('chai-http')
const app = require('../app')
chai.use(chaitHttp)
const expect = chai.expect
const should = chai.should()

describe('API Middleware', function () {
  describe('Authorization Header Error Validation', function() {
    it('should reject missing "Authorization" header', function(done) {
      chai.request(app).get('/v1')
      .then(function(res) {
        expect(res).to.have.status(401)
        expect(res.unauthorized).to.equal(true)
        expect(res.text).to.eql('Invalid Authorization Header')
        done()
      })
      .catch(function(err) {
        done(err)
      })
    })

    it('should reject invalid "Authorization" header', function(done) {
      chai.request(app).get('/v1').set('Authorization', `Bearer <something>`)
      .then(function(res) {
        expect(res).to.have.status(401)
        expect(res.unauthorized).to.equal(true)
        expect(res.text).to.eql('Invalid Authorization Token')
        done()
      })
      .catch(function(err) {
        done(err)
      })
    })
  })
  // describe('it should accept valid POST /contact', function() {
  //   beforeEach(function() {
  //     this.client = chai.request(app).set('Authorization', `Bearer ${token}`)
  //   })

  //   it('Type: happy', function(done) {
  //     this.client.post('/v1/contact')
  //   })

  // })

})
