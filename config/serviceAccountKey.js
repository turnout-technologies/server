const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER,
  FIREBASE_CLIENT
} = process.env

module.exports = {
  "type": FIREBASE_TYPE || "service_account",
  "project_id": FIREBASE_PROJECT_ID || "turnout-dd144",
  "private_key_id": FIREBASE_PRIVATE_KEY_ID || "186e6f766b7a85ee3ff1b60e31563ac282760a62",
  "private_key": FIREBASE_PRIVATE_KEY ||"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCaZ1PHZXtQWpFP\n0r4m8qDKWT5K4P/4puSv0r1a89MUiyxlybmAIjIxpRpGwIvnzPIvKZAFyAqaVJP/\n0eR8L/VBwAhEVDB83s3W23SUnHjEtjNN+LM6sRjtOJ8UtUh4g5fHIgrb8h2Gi4NU\nxySwRIVZI3MCCXvS5EfjqciEcXKNBhxRVH0SmFETsjqEfkMtYPU+Znm7RjSvOIPn\n9LjdKLj8ErvS35NwN9iRsaL7vqHpQWotu107eU3Cbz7ny8nvm9Hg3pr+PiVjLVbc\nb3dcas2QweutaX6xTEf5k9FBEGuJVz1Nns3+SjnIcy0NDzfFrCRX4wMTX00sGM1c\nv7g7MUAFAgMBAAECggEAN1IYIVQJ16Nrdvch7CB4XaeV+wwcikF5pElUUNcVZMHs\nmVeqX+9gnoryHDF2rwmuKBmzIW8n5V2yXTEdtSUVsYYVMC4d5U+K3pVocqqRVqGV\nRjV6Oegj7zKfRLMjERLM+asHywA3dfJcjq5/Rax3PpXF6g/tzoS+ASLe1h0zlrTw\nNWm1oPGHx29hS3nhGzeiwvz6VjfMKlbH1YGMEox+A7BHvL8XTIMmhrzL6j2RrJ9F\n9TQ5DsDpTw3V/SZexg+GRdj7BE5ivGu/VdVvrxvFsfj/rtimOSlbjzXBJxgyHq/I\niYjeaHSzQQKU9utMCDcBl4ExartexEAn3ZfZ+1O6zQKBgQDOXw5iURwc4AEcm3/q\nnHSYkdCwEGUxoYV+kGlK2uIIP4Jv2ytKGRrGOi0ucGXyiS5hR3vDSkSU116atUMa\n2tB09eosomV4McnpwG5vZsKO3wgk7VoR4PLm8YxB9pDyLOjJqo7vW1Tl1c6Dk2+p\nz6I3fM/95fRpl2yd6kFM0VzO4wKBgQC/iPUOLZ0fEsld5egAIqt4kRH5TE9Owi3C\nMNY8ZBCWHGHFfF3thjqd57WePBz5LsNi3G8tO/xuseFTCjOwe6I/CoO77/ZinIsJ\nkyMr/0Hcv+QrNPlsVhJwoGYDsqq4v8O6Y+kiSyNW33IhKBH54PEwkLB5V/jYF/5E\nu0VI2cpB9wKBgQCBImgMy3ZM9zqa3Q7ZDtfC1JOCaG/583lmLhVE2txPjvYe6kUX\nU8g2PBcjlP+mGYMlKibel+18OZwgMMZx2nRQi8Th8yiNYpJXK6uvF90sq5EcEk2n\nHFzCeGlsqU4fzExKTOiuDDd+riBQowRffOaj0/0OgkNDg5Za5kfAOs3ZQwKBgDQI\ndOphIeorJGFJ7/j5cjPS1Vswi+sNfXjf45OMa6UcGMOZwbqhWJNFO2W9VvGq7pGQ\n6PMU9MLtuBTjFJ/BNpaBuL/5tKmddXgobMmrEq1xw/6o6Ymw6FmIea5Pf2mpTvb3\n5YHXf8Y99bdkN1326g8Tf523dHbgLcdmSLA92mCJAoGAM/Z6CoCcaaCQvZpedobi\n2HwWjkt/YbtaHxSxcblkLHW4TUK8cWJb+dyNdCo8LvwhD4pZNLzkANZ1xcO5UAod\nB8kGPJjHMIIzdJ1fuIkoldHrUXpENv5Gu/eqAomxOXLEi0+U/1ywdFKTdrFUQNjq\nQKObCRXk9RLp0Kt+h/bXaTM=\n-----END PRIVATE KEY-----\n",
  "client_email": FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-2f2im@turnout-dd144.iam.gserviceaccount.com",
  "client_id": FIREBASE_CLIENT_ID || "114456243256613704895",
  "auth_uri": FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  "token_uri": FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": FIREBASE_AUTH_PROVIDER || "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": FIREBASE_CLIENT || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2f2im%40turnout-dd144.iam.gserviceaccount.com"
}
