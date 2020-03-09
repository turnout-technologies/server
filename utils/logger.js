let logger
switch(process.env.NODE_ENV) {
  case 'test':
    const Logger = require('heroku-logger').Logger
    logger = new Logger({
      level: 'none'
    })
    break
  default:
    logger = require('heroku-logger')

}
module.exports = logger
