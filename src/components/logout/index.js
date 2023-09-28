import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './index.styl';

const ROOT_URL = API_URL || 'http://localhost:3000/api/'; // eslint-disable-line no-undef

export default class Logout extends Component {
  constructor(props) {
    super(props);

    this.onButtonClick = this.onButtonClick.bind(this);
  }
  onButtonClick() {
    axios.post(`${ROOT_URL}signout`)
      .then(() => {
        this.props.setAppState({loggedIn: false, times: []});
      })
      .catch(err => {
        this.props.setAppState({loggedIn: false, times: []});
        console.log(err);
      });
  }
  render() {
    return (
      <div className="logout-wrapper">
        <p>Welcome {this.props.username}</p>
        <button
          className="logout-button"
          onClick={this.onButtonClick}
        >
          Logout
        </button>
      </div>
    );
  }
}

Logout.propTypes = {
  setAppState: PropTypes.func.isRequired
};
