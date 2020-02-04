const uuid = require('uuid/v1')
const moment = require('moment')

class Answer {
  constructor({ text }) {
    this.id = uuid()
    this.text = text
  }

  json() {
    return {
      id: this.id,
      text: this.text,
    }
  }
}

module.exports = Answer
