const uuid = require('uuid/v1')
const moment = require('moment')

const Question = require('./question')

class Ballot {
  constructor(title) {
    this.id = uuid()
    this.title = title
    this.questions = []
    this.createdAt = moment().unix()
    this.date = null
  }

  addQuestion(title) {
    const question = new Question(title)
    this.questions.push(question)
    return question
  }

  json() {
    return {
      id: this.id,
      title: this.title,
      questions: this.questions.map(question => question.json()),
      createdAt: this.createdAt,
      date: this.date
    }
  }
}

module.exports = Ballot
