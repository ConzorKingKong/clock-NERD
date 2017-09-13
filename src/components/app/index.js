import React, {Component} from 'react'
import Titlebar from '../titlebar'
import Login from '../login'
import Register from '../register'
import Logout from '../logout'
import Clock from '../clock'
import axios from 'axios'
import gong from '../../assets/gong.mp3'
import loop from '!!file-loader!../../assets/loop.js'

import './app.styl'

export default class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loggedIn: false,
      times: [],
      alarm: false
    }

    const dayKey = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday"
    }

    // TODO handle if else no worker
    // TODO find how multiple workers spawn(?)
    this.worker = new Worker(loop)
    this.worker.onmessage = (e) => {
      if (e.data === null) {
        this.worker.postMessage(this.state.times)
      } else {
        const {hours, minutes, seconds, ampm} = e.data.time
        const {day} = e.data
        const alarmNotification = new Notification("Alarm Clock", {body: `Your alarm for ${hours}:${minutes}:${seconds} ${ampm} on ${dayKey[day]} went off`})
        this.worker.postMessage(this.state.times)
        this.setState({
          alarm: true
        })
      }
    }

    this.onButtonClick = this.onButtonClick.bind(this)
    this.setAppState = this.setAppState.bind(this)
  }

  componentWillMount () {
    axios.get('http://localhost:3000/api/loginstatus')
    .then(res => {
      const {loggedIn, times} = res.data
      this.setState({
        times,
        loggedIn
      })
    })
    .catch(err => {
      console.log("app error ", err)
    })
  }

  setAppState (e) {
    this.setState(e)
  }

  onButtonClick (e) {
    e.preventDefault()
    this.setState({alarm: false})
  }

  render () {
    const {worker} = this
    const {loggedIn, times, alarm} = this.state
    // TODO if else to handle notification. if permission
    if (loggedIn) Notification.requestPermission()
    if (loggedIn) worker.postMessage(times)
    return (
      <div className='wrapper' style={{display: 'flex', flexDirection: 'column'}}>
        <Titlebar setAppState={this.setAppState} loggedIn={loggedIn}/>
        <Clock times={times} setAppState={this.setAppState} loggedIn={loggedIn}/>
        { alarm && <div><audio src={gong} autoPlay loop/> <button onClick={this.onButtonClick}>■</button></div> }
      </div>
    )
  }
}