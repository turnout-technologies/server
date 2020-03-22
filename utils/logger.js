let logger
switch(process.env.NODE_ENV) {
  case 'test':
    const Logger = require('heroku-logger').Logger
    const level = process.env.CI ? 'none' : 'info'
    logger = new Logger({
      level,
    })
    break
  default:
    logger = require('heroku-logger')

}
module.exports = logger
