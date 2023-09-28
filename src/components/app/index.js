import React, {Component} from 'react';
import axios from 'axios';
import loop from '!!file-loader!../../assets/loop';
import Titlebar from '../titlebar';
import Clock from '../clock';
import AlarmModal from '../alarmModal';
import cleanNums from '../../helpers/cleanNums';
import './index.styl';

const ROOT_URL = API_URL || 'http://localhost:3000/api/'; // eslint-disable-line no-undef

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      username: '',
      times: [],
      date: new Date(),
      alarm: false,
      error: '',
      alarmTime: {}
    };
    this.setAppState = this.setAppState.bind(this);
    this.notificationListener = this.notificationListener.bind(this);
  }
  componentWillMount() {
    axios.get(`${ROOT_URL}loginstatus`)
      .then(res => {
        const {loggedIn, times, username} = res.data;
        this.setState({
          times,
          loggedIn,
          username
        });
      })
      .catch(err => {
        console.log('err getting login status', err);
      });
    const dayKey = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ];
    if (window.Worker) {
      this.worker = new Worker(loop);
      this.worker.onmessage = e => {
        const {date} = e.data;
        this.setState({date});
        if (Object.keys(e.data).length !== 1) {
          const {
            hours,
            minutes,
            seconds,
            ampm
          } = e.data.time;
          const {day} = e.data;
          const alarmTime = {...e.data.time, day: e.data.day};
          if (window.Notification) {
            new Notification('Alarm Clock', { // eslint-disable-line no-new
              body: `Your alarm for ${hours}:${minutes}:${seconds} ${ampm} on ${dayKey[day]} went off`
            });
          }
          this.setState({
            alarm: true,
            alarmTime
          });
        }
      };
      this.worker.onerror = e => {
        console.log('outside service worker error', e);
      };
      setInterval(() => {this.worker.postMessage(this.state.times);}, 1000);
    } else {
      this.setState({
        error: 'Alarms will only go off if this tab is active for the alarm time. Please upgrade to a new browser for the full experience.'
      });
    }
    if ('Notification' in window) {
      document.body.addEventListener('click', this.notificationListener);
    }
  }
  componentWillUnmount() {
    this.worker.terminate();
    document.body.removeEventListener(this.notificationListener);
  }
  setAppState(e) {
    this.setState(e);
  }
  notificationListener() {
    if (this.state.loggedIn && (Notification.permission !== 'denied' || Notification.permission === 'default')) Notification.requestPermission();
  }
  render() {
    const {
      loggedIn,
      times,
      date,
      alarm,
      alarmTime,
      error,
      username
    } = this.state;
    let displayHours = date.getHours();
    const displayMinutes = cleanNums(date.getMinutes());
    const displaySeconds = cleanNums(date.getSeconds());
    let displayAmpm = 'AM';
    if (displayHours === 12) {
      displayAmpm = 'PM';
    } else if (displayHours >= 13 && displayHours !== 24) {
      displayHours -= 12;
      displayAmpm = 'PM';
    } else if (displayHours === 24) {
      displayHours -= 12;
    }
    displayHours = cleanNums(displayHours);
    document.title = `Alarm Clock ${displayHours}:${displayMinutes}:${displaySeconds}${displayAmpm}`;
    return (
      <div className="wrapper">
        <Titlebar
          setAppState={this.setAppState}
          loggedIn={loggedIn}
          username={username}
        />
        <h1>{error}</h1>
        <Clock
          times={times}
          date={date}
          setAppState={this.setAppState}
          loggedIn={loggedIn}
        />
        { alarm &&
        <AlarmModal
          setAppState={this.setAppState}
          alarmTime={alarmTime}
        /> }
      </div>
    );
  }
}
