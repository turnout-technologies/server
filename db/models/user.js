const uuid = require('uuid/v1')
const moment = require('moment')

class User {
  constructor({ name, email, phone, token}) {
    this.id = uuid()
    this.name = name
    this.email = email
    this.createdAt = moment().unix()
    this.phone = phone
    this.token = token
  }

  json() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      email: this.email,
      phone: this.phone,
      token: this.token
    }
  }
}

module.exports = User
