const chai = require('chai'),
      chaitHttp = require('chai-http')
// const app = require('../app')
chai.use(chaitHttp)
const expect = chai.expect
const should = chai.should()

// describe('Contact API', function () {
//   describe('it should accept valid POST /contact', function(done) {
//     beforeEach(function() {
//       this.client = chai.request(app).set('Authorization', `Bearer ${token}`)
//     })

//     it('Type: happy', function(done) {
//       this.client.post('/v1/contact')
//     })

//   })

// })
