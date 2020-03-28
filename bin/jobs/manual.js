
const { sendNotifications } = require('./common')
const logger = require('../../utils/logger')
const readlineSync = require('readline-sync')

const startJob = async () => {
  try {
    const body = readlineSync.question('Push notification message: ')
    logger.info('Starting manual push-notifications job...')
    await sendNotifications({
      sound: 'default',
      priority: 'high',
      body,
      channelId: 'manual',
    })
    logger.info('Job complete.')
    process.exit(0)
  } catch (err) {
    logger.error(err.message, err)
    process.exit(1)
  }
}

startJob()
