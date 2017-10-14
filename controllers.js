var mongo = require('mongodb').MongoClient
var bcrypt = require('bcryptjs')
var salt = 10
var ObjectId = require('mongodb').ObjectId
var MONGO_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1/clock'
var users = ''

mongo.connect(MONGO_URL, function(err, conn) {
  if (err)  {
    console.log(err)
    return
  }
  users = conn.collection('users')
})

module.exports.signup = function(req, res) {
  users.findOne({email: req.body.email}, function(err, user) {
    if (user !== null) {
      res.status(401).send({error: 'User already exists!', loggedIn: false})
    } else {
      var hashedPassword = bcrypt.hash(req.body.password, salt, function(err, hash) {
        if (err) {
          console.log(err)
          return
        }
        users.insert({
          created: Date.now(),
          email: req.body.email,
          username: req.body.username,
          password: hash,
          times: []
        }, function(err, user) {
          if (err) {
            console.log(err)
            res.status(401).send({error: 'Error', loggedIn: false})
          } else {
            req.session.id = user.ops[0]._id
            res.status(200).send({times: user.ops[0].times, loggedIn: true})
          }
        })
      })
    }
  })
}

module.exports.signin = function(req, res) {
  users.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      console.log(err)
      res.status(401).send({error: 'Error', loggedIn: false})
    } else if (user === null) {
      res.status(401)
      res.json({'error': 'No user', 'loggedIn': false})
    } else {
      bcrypt.compare(req.body.password, user.password, function(err, answer) {
        if (err) {
          console.log(err)
          return
        }
        if (answer) {
          req.session.id = user._id
          res.status(200).send({times: user.times, loggedIn: true})
        } else {
          res.status(401).send({error: 'Incorrect password', loggedIn: false})
        }
      })
    }
  })
}

module.exports.signout = function(req, res) {
  if (req.session.id) {
    delete req.session.id
    delete req.session
    res.send('deleted')
  } else {
    res.send('you are not signed in!')
  }
}

module.exports.addtime = function(req, res) {
  console.log("request", req)
  console.log("request.session", req.session)
  if (!req.session.id) {
    res.status(401).send({error: 'You must be logged in', loggedIn: false})
    return
  }
  var newTime = req.body
  if (newTime._id !== '') {
    newTime._id = new ObjectId(newTime._id)
    users.findOneAndUpdate({_id: new ObjectId(req.session.id), "times._id": new ObjectId(newTime._id)}, {$set: {"times.$": newTime}}, function(err, answer) {
      if (err) {
        console.log(err)
        res.status(401).send('Error')
      } else {
        users.findOne({_id: new ObjectId(req.session.id)}, function(err, user) {
          if (err) {
            console.log(err)
            res.status(401).send('Error')
          } else {
            res.status(200).send(user.times)
          }
        })
      }
    })
  } else {
    newTime._id = new ObjectId()
    var cont = true
    users.findOne({_id: new ObjectId(req.session.id)}, function(err, user) {
      if (err) {
        console.log(err)
        res.status(401).send('Error')
      } else {
        user.times.forEach(function(time) {
          if (time.hours === newTime.hours && time.minutes === newTime.minutes && time.seconds === newTime.seconds && time.ampm === newTime.ampm) {
            cont = false
            res.status(400).send('Time already exists. Please edit existing time to add new days')
            return
          }
        })
        if (cont) {
          users.findOneAndUpdate({_id: new ObjectId(req.session.id)}, {$addToSet: {times: newTime} }, function(err, user) {
            if (err) {
              console.log(err)
              res.status(401).send('Error')
            } else {
              users.findOne({_id: new ObjectId(req.session.id)}, function(err, user) {
                if (err) {
                  console.log(err)
                  res.status(401).send('Error')
                } else {
                  res.status(200).send(user.times)
                }
              })
            }
          })
        }
      }
    })
  }
}

module.exports.deletetime = function(req, res) {
  if (!req.session.id) res.status(401).send("You are not signed in")
  if (!req.body.id) res.status(404).send("No time ID was given")
  users.findOneAndUpdate(
    {_id: new ObjectId(req.session.id)},
    {$pull: {times: {_id: new ObjectId(req.body.id)}}}, function(err, newTimes) {
    if (err) {
      console.log(err)
      res.status(401).send("Error")
    }
    if (newTimes) {
      const {times} = newTimes.value
      const cleanTimes = times.filter(t => {
        return t._id.toString() !== req.body.id
        })
      newTimes.value.times = cleanTimes
      res.status(200).send(newTimes)
    }
  })
}

module.exports.loginstatus = function(req, res) {
  if (req.session.id) {
    users.findOne({_id: new ObjectId(req.session.id)}, function(err, user) {
      if (err) {
        console.log(err)
        delete req.session.id
        delete req.session
        res.status(401).send({error: 'Error checking status. you have been logged out', loggedIn: false, times: []})
      } else {
        res.status(200).send({times: user.times, loggedIn: true})
      }
    })
  } else {
    res.status(200).send({loggedIn: false, times: []})
  }
}