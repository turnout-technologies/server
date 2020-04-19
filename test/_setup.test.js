const { CI } = process.env

if (!CI) {
  const dotenv = require('dotenv')
  const path = require('path')
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') })
}
const { FIREBASE_TEST_EMAIL, FIREBASE_TEST_PASSWORD } = process.env

before(async function() {

})

after(async function() {

})
