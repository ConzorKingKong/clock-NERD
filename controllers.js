var mongo = require('mongodb').MongoClient
var bcrypt = require('bcrypt')
var salt = 10
var ObjectId = require('mongodb').ObjectId
var users = ''

mongo.connect('mongodb://127.0.0.1/clock', function(err, conn) {
  if (err)  { 
    console.log(err)
    return 
  }
  users = conn.collection('users')
})

function cleanUser (user) {
  var cleanUser = {}
  var keys = Object.keys(user)
  if (user.hasOwnProperty('value')) {
    keys = Object.keys(user.value)
  }
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== "password" && user.hasOwnProperty('value')) {
      cleanUser[keys[i]] = user.value[keys[i]]
    } else if (keys[i] !== 'password') {
      cleanUser[keys[i]] = user[keys[i]]
    }
  }
  return cleanUser
}

module.exports.signup = function(req, res) {

  users.findOne({email: req.body.email}, function(err, user) {
    if (user !== null) {
      res.status(401).send({error: 'User already exists!', loggedIn: false})
    } else {
      // set up schema and handle bad schema
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
            res.status(401).send({error: 'error', loggedIn: false})
          } else {
            req.session.id = user.ops[0]._id
            // dont send back user info
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
      res.status(401).send({error: 'error', loggedIn: false})
    } else if (user === null) {
      res.status(401)
      res.json({'error': 'no user', 'loggedIn': false})
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
          res.status(401).send({error: 'incorrect password', loggedIn: false})
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
  if (!req.session.id) {
    res.send({error: 'You must be logged in', loggedIn: false})
    return
  }
  // first try to find if same time exists with different days. then run this code if not true
  var newTime = req.body
  newTime._id = new ObjectId()
  users.findOneAndUpdate({_id: new ObjectId(req.session.id)}, {$addToSet: {times: newTime} }, function(err, user) {
    if (err) {
      console.log(err)
      res.status(401).send('error')
    } else {
      users.findOne({_id: new ObjectId(req.session.id)}, function(err, user) {
        if (err) {
          console.log(err)
          res.status(401).send('error')
        } else {
          res.status(200).send(user.times)
        }
      })
    }
  })
}

module.exports.deletetime = function(req, res) {
  if (!req.session.id) res.status(401).send("You are not signed in")
  if (!req.body.id) res.status(404).send("No time ID was given")
  users.findOneAndUpdate(
    {_id: new ObjectId(req.session.id)},
    {$pull: {times: {_id: new ObjectId(req.body.id)}}}, function(err, newTimes) {
    if (err) {
      console.log(err)
      res.status(401).send("error")
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
        res.status(401).send({error: 'error checking status. you have been logged out', loggedIn: false, times: []})
      } else {
        res.status(200).send({times: user.times, loggedIn: true})
      }
    })
  } else {
    res.status(200).send({loggedIn: false, times: []})
  }
}