const uuid = require('uuid/v1')
const moment = require('moment')

const Answer = require('./answer')
const shuffle = require('../../utils/shuffle')

class Question {
  constructor(title) {
    this.id = uuid()
    this.title = title
    this.createdAt = moment().unix()
    this.answers = []
  }

  addAnswer (title) {
    this.answers.push(new Answer(title))
  }

  scramble () {
    this.answers = shuffle(this.answers)
  }

  json() {
    let answers = this.answers.map(answer => answer.json());
    return {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      answers,
    }
  }
}

module.exports = Question
