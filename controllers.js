var { MongoClient, ObjectId } = require('mongodb')
var bcrypt = require('bcryptjs')
var salt = 10
// changed url to mongo for mongo docker container
var MONGO_URL = process.env.MONGODB_URI || 'mongodb://mongo:27017/clock'
var client = null
var db = null
var users = null

// Connect to MongoDB with new driver API
MongoClient.connect(MONGO_URL).then((mongoClient) => {
  client = mongoClient
  db = client.db() // Gets the default database from the connection string
  users = db.collection('users')
  console.log('Connected to MongoDB')
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err)
})

module.exports.signup = async function(req, res) {
  if (!users) {
    console.log("Database not connected yet")
    return res.status(503).send({error: 'Database not ready', loggedIn: false})
  }
  try {
    const user = await users.findOne({email: req.body.email})
    if (user !== null) {
      res.status(401).send({error: 'User already exists!', loggedIn: false})
    } else {
      const hash = await bcrypt.hash(req.body.password, salt)
      const result = await users.insertOne({
        created: Date.now(),
        email: req.body.email,
        username: req.body.username,
        password: hash,
        times: []
      })
      req.session.id = result.insertedId
      res.status(200).send({times: [], username: req.body.username, loggedIn: true})
    }
  } catch (err) {
    console.log("ERROR", err)
    res.status(401).send({error: 'Error', loggedIn: false})
  }
}

module.exports.signin = async function(req, res) {
  if (!users) {
    return res.status(503).send({error: 'Database not ready', loggedIn: false})
  }
  try {
    const user = await users.findOne({email: req.body.email})
    if (user === null) {
      res.status(401).json({'error': 'No user', 'loggedIn': false})
    } else {
      const answer = await bcrypt.compare(req.body.password, user.password)
      if (answer) {
        req.session.id = user._id
        res.status(200).send({times: user.times, username: user.username, loggedIn: true})
      } else {
        res.status(401).send({error: 'Incorrect password', loggedIn: false})
      }
    }
  } catch (err) {
    console.log(err)
    res.status(401).send({error: 'Error', loggedIn: false})
  }
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

module.exports.addtime = async function(req, res) {
  if (!req.session.id) {
    res.status(401).send({error: 'You must be logged in', loggedIn: false})
    return
  }
  if (!users) {
    return res.status(503).send({error: 'Database not ready', loggedIn: false})
  }
  var newTime = req.body
  var cont = true
  try {
    if (newTime._id !== '') {
      newTime._id = new ObjectId(newTime._id)
      const user = await users.findOne({_id: new ObjectId(req.session.id)})
      user.times.forEach(function(time) {
        if (time.hours === newTime.hours && time.minutes === newTime.minutes && time.seconds === newTime.seconds && time.ampm === newTime.ampm && time._id.toString() !== newTime._id.toString()) {
          cont = false
          res.status(400).send({error: 'Time already exists. Please edit existing time to add new days', loggedIn: true})
          return
        }
      })
      if (cont) {
        await users.findOneAndUpdate(
          {_id: new ObjectId(req.session.id), "times._id": new ObjectId(newTime._id)},
          {$set: {"times.$": newTime}}
        )
        const updatedUser = await users.findOne({_id: new ObjectId(req.session.id)})
        res.status(200).send(updatedUser.times)
      }
    } else {
      newTime._id = new ObjectId()
      const user = await users.findOne({_id: new ObjectId(req.session.id)})
      user.times.forEach(function(time) {
        if (time.hours === newTime.hours && time.minutes === newTime.minutes && time.seconds === newTime.seconds && time.ampm === newTime.ampm) {
          cont = false
          res.status(400).send({error: 'Time already exists. Please edit existing time to add new days', loggedIn: true})
          return
        }
      })
      if (cont) {
        await users.findOneAndUpdate(
          {_id: new ObjectId(req.session.id)},
          {$addToSet: {times: newTime}}
        )
        const updatedUser = await users.findOne({_id: new ObjectId(req.session.id)})
        res.status(200).send(updatedUser.times)
      }
    }
  } catch (err) {
    console.log(err)
    res.status(401).send({error: 'Error', loggedIn: true})
  }
}

module.exports.deletetime = async function(req, res) {
  if (!req.session.id) return res.status(401).send("You are not signed in")
  if (!req.body.id) return res.status(404).send("No time ID was given")
  if (!users) return res.status(503).send("Database not ready")
  try {
    const result = await users.findOneAndUpdate(
      {_id: new ObjectId(req.session.id)},
      {$pull: {times: {_id: new ObjectId(req.body.id)}}},
      {returnDocument: 'after'} // Return the updated document
    )
    if (result) {
      res.status(200).send({value: result})
    } else {
      res.status(404).send("User not found")
    }
  } catch (err) {
    console.log(err)
    res.status(401).send("Error")
  }
}

module.exports.loginstatus = async function(req, res) {
  if (!users) {
    return res.status(503).send({error: 'Database not ready', loggedIn: false, times: []})
  }
  if (req.session.id) {
    try {
      const user = await users.findOne({_id: new ObjectId(req.session.id)})
      res.status(200).send({times: user.times, username: user.username, loggedIn: true})
    } catch (err) {
      console.log(err)
      delete req.session.id
      delete req.session
      res.status(401).send({error: 'Error checking status. you have been logged out', loggedIn: false, times: []})
    }
  } else {
    res.status(200).send({loggedIn: false, times: []})
  }
}