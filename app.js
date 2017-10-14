var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var PORT = process.env.PORT || 3000
var path = require('path')
var controllers = require('./controllers.js')
var SUPER_SECRET = process.env.SECRET || 'VAVAVOOM'

app.use(cookieSession({
    name: 'session',
    keys: [SUPER_SECRET],
    maxAge: 90 * 24 * 60 * 60 * 1000
}))

app.use(bodyParser.json())

app.use(express.static('public'))

app.use(function (req, res, next) {
  console.log("outside https")
  if (req.headers['x-forwarded-proto'] !== 'https') {
    console.log("inside")
    res.redirect(302, 'https://' + req.hostname + req.originalUrl)
  } else {
    next()
  }
})

app.use(function (req, res, next) {
  console.log("setting headers")
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.get('/', function(req, res) {
  console.log("outside https")
  if (req.headers['x-forwarded-proto'] !== 'https') {
    console.log("inside")
    res.redirect(302, 'https://' + req.hostname + req.originalUrl)
  } else {
    res.sendFile(path.join(__dirname, 'index.html'))
  }
})

app.post('/api/signup', controllers.signup)
app.post('/api/signin', controllers.signin)
app.post('/api/signout', controllers.signout)
app.post('/api/addtime', controllers.addtime)
app.post('/api/deletetime', controllers.deletetime)
app.get('/api/loginstatus', controllers.loginstatus)

app.listen(PORT)