const { checkBallotToday, sendNotifications } = require('./common')
const logger = require('../../utils/logger')

const startJob = async () => {
  try {
    logger.info('Starting polls start job...')
    const isLive = await checkBallotToday()
    if (isLive) {
      await sendNotifications({
        sound: 'default',
        priority: 'high',
        body: 'Polls are open! Submit your ballot within the next 4 hours.',
        channelId: 'poll-notifications',
      })
    }
    logger.info('Polls start job complete.')
    process.exit(0)
  } catch (err) {
    logger.error(err.message, err)
    process.exit(1)
  }
}

startJob()