const moment = require('moment')

class User {
  constructor({ id, name, email, phone, avatarURL }) {
    this.id = id
    this.name = name
    this.email = email
    this.createdAt = moment().unix()
    this.phone = phone
    this.avatarURL = avatarURL
  }

  json() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      email: this.email,
      phone: this.phone,
      avatarURL: this.avatarURL
    }
  }
}

module.exports = User
