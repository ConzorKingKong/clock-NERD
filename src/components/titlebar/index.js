import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Login from '../login';
import Register from '../register';
import Logout from '../logout';
import './index.styl';

export default class Titlebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: false,
      register: false
    };

    this.onButtonClick = this.onButtonClick.bind(this);
    this.setLoginState = this.setLoginState.bind(this);
    this.setRegisterState = this.setRegisterState.bind(this);
    this.setLoginRef = this.setLoginRef.bind(this);
    this.setRegisterRef = this.setRegisterRef.bind(this);
  }
  onButtonClick(e) {
    const {state} = this;
    const {name} = e.target;
    const obj = {};
    obj[name] = !state[name];
    this.setState(obj);
  }
  setLoginState() {
    this.setState({login: false});
  }
  setRegisterState() {
    this.setState({register: false});
  }
  setLoginRef(r) {
    const {loginButton} = this.state;
    if (!loginButton) this.setState({loginButton: r});
  }
  setRegisterRef(r) {
    const {registerButton} = this.state;
    if (!registerButton) this.setState({registerButton: r});
  }
  render() {
    const {
      login,
      register,
      loginButton,
      registerButton
    } = this.state;
    const {loggedIn, setAppState, username} = this.props;
    return (
      <div className="titlebar-wrapper">
        { !loggedIn &&
        <div className="button-wrapper">
          { !loggedIn &&
          <button
            ref={this.setLoginRef}
            className="login-button"
            name="login"
            onClick={this.onButtonClick}
          >
            Log In
          </button>
          }
          { login &&
          <Login
            reference={loginButton}
            setAppState={setAppState}
            setLoginState={this.setLoginState}
          />
          }
        </div>
        }
        {!loggedIn &&
        <div className="button-wrapper">
          <button
            ref={this.setRegisterRef}
            className="register-button"
            name="register"
            onClick={this.onButtonClick}
          >
            Register
          </button>
          { register &&
          <Register
            reference={registerButton}
            setAppState={setAppState}
            setRegisterState={this.setRegisterState}
          />
          }
        </div>
        }
        { loggedIn && <Logout username={username} setAppState={setAppState} /> }
      </div>
    );
  }
}

Titlebar.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  setAppState: PropTypes.func.isRequired
};
