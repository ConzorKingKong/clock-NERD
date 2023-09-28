import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const ROOT_URL = API_URL || 'http://localhost:3000/api/'; // eslint-disable-line no-undef

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      errorEmail: ''
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onInputBlur = this.onInputBlur.bind(this);
    this.eventListener = this.eventListener.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }
  componentWillMount() {
    document.body.addEventListener('click', this.eventListener);
    document.body.addEventListener('touchend', this.eventListener);
  }
  componentWillUnmount() {
    const {setLoginState} = this.props;
    document.body.removeEventListener('click', this.eventListener);
    document.body.removeEventListener('touchend', this.eventListener);
    setLoginState();
  }
  onInputChange(e) {
    const {name, value} = e.target;
    const obj = {};
    obj[name] = value;
    this.setState(obj);
  }
  onInputBlur(e) {
    const {name, value} = e.target;
    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const emailRegex = /\S+@\S+\.\S+/;
    const obj = {};
    obj[`error${capitalize(name)}`] = '';
    if (name === 'email') {
      if (!emailRegex.test(value) && value !== '') obj[`error${capitalize(name)}`] = 'Email is not valid';
    }
    this.setState(obj);
  }
  onFormSubmit(e) {
    e.preventDefault();
    const {password} = this.state;
    let {email} = this.state;
    const {setAppState} = this.props;
    email = email.toLowerCase();
    axios.post(`${ROOT_URL}signin`, {email, password})
      .then(res => {
        const {loggedIn, times, username} = res.data;
        setAppState({
          loggedIn,
          times,
          username
        });
        this.setState({
          email: '',
          password: '',
          error: '',
          errorEmail: ''
        });
      })
      .catch(err => {
        const {data} = err.response;
        setAppState({loggedIn: data.loggedIn});
        this.setState({
          email: '',
          password: '',
          errorEmail: '',
          error: data.error
        });
      });
  }
  eventListener(e) {
    const {reference, setLoginState} = this.props;
    if (e.target === reference || !this.loginForm.contains(e.target)) setLoginState();
  }
  render() {
    const {
      email,
      password,
      error,
      errorEmail
    } = this.state;
    return (
      <form
        ref={r => {this.loginForm = r;}}
        onSubmit={this.onFormSubmit}
      >
        <p>{error}</p>
        <p>{errorEmail}</p>
        <h3>Login</h3>
        <input
          onChange={this.onInputChange}
          onBlur={this.onInputBlur}
          value={email}
          type="text"
          placeholder="Email"
          name="email"
        />
        <input
          onChange={this.onInputChange}
          value={password}
          type="password"
          placeholder="Password"
          name="password"
        />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

Login.propTypes = {
  setLoginState: PropTypes.func.isRequired,
  setAppState: PropTypes.func.isRequired,
  reference: PropTypes.object.isRequired
};
