const { Expo } = require('expo-server-sdk')
const admin = require('firebase-admin')
const moment = require('moment-timezone')

let serviceAccount = require('../config/serviceAccountKey.json')
const est = 'America/New_York'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
// Create a new Expo SDK client
let expo = new Expo()

const checkBallotToday

const retrieveVoters = async () => {
  const snapshot = await db.collection('users').get()
  const users = []
  // Grab the doc in data form
  snapshot.forEach(doc => {
    let user = doc.data()
    if (user.pushToken) users.push(user.pushToken)
  })

  return users
}

const sendNotifications = async () => {
  try {

    const pushTokens = await retrieveVoters()
    // Create the messages that you want to send to clents
    let messages = []
    for (let pushToken of pushTokens) {
      // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
      messages.push({
        to: pushToken,
        sound: 'default',
        priority: 'high',
        body: 'Polls are open!',
        channelId: 'poll-notifications',
      })
    }

    // TODO
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
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    }

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

sendNotifications()
