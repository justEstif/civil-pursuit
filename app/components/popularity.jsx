'use strict';

import React            from 'react';

class Popularity extends React.Component {
  static propTypes = {
    number : React.PropTypes.number
  }

  animate () {
    const { number } = this.props;

    const bar = React.findDOMNode(this.refs.bar);

    bar.style.width = `${number}%`;
  }

  render () {
    const { number } = this.props;

    setTimeout(this.animate.bind(this), 1000);

    return (
      <div className="syn-popularity">
        <div className="syn-popularity-bar" style={{ width : 0 }} ref="bar">{ `${number}%` }</div>
      </div>
    );
  }
}

export default Popularity;