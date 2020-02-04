const Chance = require('chance')
const chance = new Chance()
const Ballot = require('../db/models/ballot')
const db = require('../db')

function generateBallot(questionCount) {
  const ballot = new Ballot({ title: chance.word() })
  let count = questionCount ? questionCount: 5

  // Create questions (random sentences with '?' at end)
  for (let i = 0; i < count; i++) {
    let question = ballot.addQuestion({
      title: chance.sentence() + '?'
    })
    for (let j = 0; j < 4; j++) {
      // All questions have 4 answers only each
      question.addAnswer({ text: chance.sentence()})
    }
  }

  return ballot
}

function seedBallots(ballotCount) {
  let count = ballotCount ? ballotCount: 10
  let Ballots = db.collection('ballots')

  for (let i = 0; i < count; i++) {
    let ballot = generateBallot()
    Ballots.doc(ballot.id).set(ballot.json())
  }
}

seedBallots(process.argv[2] ? process.argv[2] : null)
