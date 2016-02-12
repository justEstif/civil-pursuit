'use strict';

import React                        from 'react';
import Column                       from './util/column';
import PromoteButton                from './promote-button';
import PromoteEditAndGoAgainButton  from './promote-edit-and-go-again-button';

class PromoteBigScreenButtons extends React.Component {

  next () {
    const { position, emitter } = this.props;

    emitter.emit('promote', position);
  }

  render () {
    const { item, position, opposite, emitter } = this.props;

    const panelEmitter = this.props['panel-emitter'];

    if ( ! item ) {
      return ( <div></div> );
    }

    let promoteButton;

    if ( opposite ) {
      promoteButton = (
        <PromoteButton
          { ...item }
          onClick   =   { this.next.bind(this) }
          className =   "gutter-bottom promote-item-button"
          />
      );
    }

    return (
      <Column
        span        =   "50"
        className   =   { `promote-${position} promote-item-${position}` }
        ref         =   "view"
        >

        { promoteButton }

        <PromoteEditAndGoAgainButton
          item            =   { item }
          panel-emitter   =   { panelEmitter }
          />

      </Column>
    );
  }
}

export default PromoteBigScreenButtons;