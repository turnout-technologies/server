const { sendNotifications } = require('./common')
const logger = require('../../utils/logger')

const startJob = async () => {
  try {
    logger.info('Starting results processed job...')
    await sendNotifications({
      sound: 'default',
      priority: 'high',
      body: 'The results are in! Let\'s see what the winning answers are.',
      channelId: 'poll-notifications',
      data: {
        type: 'results-notification'
      }
    })
  } catch (err) {
    logger.error(err.message, err)
    process.exit(1)
  }
}

startJob()
