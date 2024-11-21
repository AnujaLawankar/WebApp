import PropTypes from 'prop-types';
import React, { Component } from 'react';

// Dummy Donate class, which at Cordova compile time, is copied over the production class to remove any trace of Stripe from Cordova
class Donate extends Component {
  render () {
    return (
      <div>
        Disabled
      </div>
    );
  }
}
Donate.propTypes = {
  classes: PropTypes.object,
  showFooter: PropTypes.bool,
};

export default Donate;
