require('dotenv').config()
const express = require('express') 
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const { expressjwt: jwt } = require('express-jwt')
const busboy = require('connect-busboy')

const RSA_PUBLIC_KEY = fs.readFileSync(process.cwd() + process.env.PUBLIC_KEY_PATH)
const connection = require('./app/functions/Database')
const TestController = require('./app/controllers/TestController')
const AuthController = require('./app/controllers/AuthController')
const FilesController = require('./app/controllers/FilesController')
const DownloadsController = require('./app/controllers/DownloadsController')
const UsersNotConfirmedController = require('./app/controllers/UsersNotConfirmedController')
const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
}))

app.use(bodyParser.json())   // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.use(busboy({
  highWaterMark: Number(process.env.BUSBOY_HIGH_WATER_MARK) // Taille du buffer 
}))

const checkIfAuthenticated = jwt({
  algorithms: [process.env.JWT_ALGORITHM],
  secret: RSA_PUBLIC_KEY,
  credentialsRequired: false
})

const verifyUserIsConfirmed = (req, res, next) => {
  const queryCheckUserIsConfirmed = "SELECT is_confirmed FROM users WHERE id = ?"
  const userId = +req.auth.sub
  connection.query(queryCheckUserIsConfirmed, [userId], (error, results, fields) => {
      if (error) throw Error
      if (Array.from(results).length > 0) {
          const user = results[0]
          if (user.is_confirmed) {
              next()
          } else {
              res.status(403).send('Accès non autorisée')
          }
      } else {
          res.status(403).send('Accès non autorisée')
      }
  })
}

app.use('/test', checkIfAuthenticated)
app.use('/test', verifyUserIsConfirmed)
app.use('/test', TestController)

app.use('/users', checkIfAuthenticated)
app.use('/users/', UsersNotConfirmedController)

app.use('/auth', AuthController)

app.use('/files', FilesController)
app.use('/files', express.static('downloads'))

app.use('/downloads', checkIfAuthenticated)
app.use('/downloads', verifyUserIsConfirmed)
app.use('/downloads', DownloadsController)
app.use('/downloads', express.static('downloads'))

app.use('/assets', express.static('public'))

app.listen(Number(process.env.PORT_LISTEN), process.env.HOST_ADDR_LISTEN)