const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const chai = require('chai'),
      chaitHttp = require('chai-http')
const app = require('../app')
chai.use(chaitHttp)
const expect = chai.expect
const should = chai.should()

describe('Firebase Connection', function () {
  describe('Header Validation', function() {
    it('should reject missing "Authorization" header', function(done) {
      chai.request(app).get('/v1')
      .then(function(res) {

        done()
      })
      .catch(function(err) {
        expect(err).should.have.status(401)
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
