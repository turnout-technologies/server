const moment = require('moment')

class User {
  constructor({ id, name, email, phone, avatarURL, pushToken }) {
    this.id = id
    this.name = name
    this.email = email
    this.createdAt = moment().unix()
    this.phone = phone
    this.avatarURL = avatarURL
    this.points = 0
    this.pushToken = pushToken ? pushToken : ''
  }

  json() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      email: this.email,
      phone: this.phone,
      avatarURL: this.avatarURL,
      points: this.points,
      pushToken: this.pushToken,
    }
  }
}

module.exports = User
