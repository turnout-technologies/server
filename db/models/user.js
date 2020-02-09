const moment = require('moment')

class User {
  constructor({ uid, name, email, phone, token}) {
    this.id = uid
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
    }
  }
}

module.exports = User
