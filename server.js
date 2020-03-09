const { NODE_ENV } = process.env
if (NODE_ENV !== 'production') require('dotenv').config()

const app = require('./app')
const logger = require('./utils/logger')

app.listen(process.env.PORT || 8000, () => {
  logger.info('Server started at port 8000')
})
