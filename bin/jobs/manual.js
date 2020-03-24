
const { sendNotifications } = require('./common')
const logger = require('../../utils/logger')

const startJob = async () => {
  try {
    logger.info('Starting manual push-notifications job...')
    await sendNotifications({
      sound: 'default',
      priority: 'high',
      body: 'Our first phase of alpha has ended. Thanks so much for your participation! You may need to open, close, then re-open the app to view our message.',
      channelId: 'poll-notifications',
    })
    logger.info('Job complete.')
    process.exit(0)
  } catch (err) {
    logger.error(err.message, err)
    process.exit(1)
  }
}

startJob()
