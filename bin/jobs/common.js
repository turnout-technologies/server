if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv')
  const path = require('path')

  switch(process.env.NODE_ENV) {
    case 'alpha':
      dotenv.config({ path: path.resolve(__dirname, '../../.env.prod') })
      break
    default:
      dotenv.config()
  }
}

const { Expo } = require('expo-server-sdk')
const admin = require('firebase-admin')
const moment = require('moment-timezone')
const logger = require('../../utils/logger')

let serviceAccount = require('../../config/serviceAccountKey')
const est = 'America/New_York'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
// Create a new Expo SDK client
let expo = new Expo()

module.exports.checkBallotToday = async () => {
  logger.info('Checking if there is a live ballot today...')
  const targetDate = moment.tz(moment.tz(est).format("YYYY-MM-DD") + " 18:00", est)
  const snapshot = await db.collection('ballots').where('date', '==', targetDate.unix()).get()
  if (snapshot.empty) {
    logger.info('No live ballot today.')
    return false
  } else {
    const docs = [];
    // Grab the doc in data form
    snapshot.forEach(doc => {
      docs.push(doc.data())
    })

    if (docs.length !== 1) throw new Error('Multiple Live Ballots')
    logger.info('Live ballot found.')
    return true
  }
}

const retrieveTokens = async () => {
  logger.info('Retrieving Expo Push Tokens...')
  const snapshot = await db.collection('users').get()
  const tokens = []
  // Grab the doc in data form
  snapshot.forEach(doc => {
    let user = doc.data()
    if (user.pushToken) tokens.push(user.pushToken)
  })

  return tokens
}

module.exports.sendNotifications = async ({ sound, priority, body, channelId }) => {
  try {
    logger.info('Beginning Push Notifications Job with:', { sound, priority, body, channelId })

    const pushTokens = await retrieveTokens()
    logger.info(`Sending Push Notifications to ${pushTokens.length} users...`)
    // Create the messages that you want to send to clents
    let messages = []
    for (let pushToken of pushTokens) {
      // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Push token ${pushToken} is not a valid Expo push token`)
        continue
      }

      // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
      messages.push({
        to: pushToken,
        sound,
        priority,
        body,
        channelId,
      })
    }

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    let chunks = expo.chunkPushNotifications(messages)
    let tickets = []
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    }

    let receiptIds = [];
    for (let ticket of tickets) {
      // NOTE: Not all tickets have IDs; for example, tickets for notifications
      // that could not be enqueued will have error information and no receipt ID.
      if (ticket.id) {
        receiptIds.push(ticket.id)
      }
    }

    let successCount = 0

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk)
      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (const receiptId in receipts) {
        const { status, message, details } = receipts[receiptId]
        if (status === "ok") {
          successCount += 1
          continue
        } else if (status === "error") {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            // The error codes are listed in the Expo documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications/#individual-errors
            // You must handle the errors appropriately.
            console.error(`The error code is ${details.error}`)
          }
        }
      }
    }

    console.log(`Successfully sent ${successCount} push-notifications.`)

    process.exit(0)
  } catch (err) {
    logger.error(err.message, err)
    process.exit(1)
  }
}
