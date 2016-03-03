'use strict';

import React from 'react';
import ButtonGroup      from './util/button-group';
import Button           from './util/button';
import Icon               from './util/icon';

class ItemButtons extends React.Component {
  toggle (section) {
    this.props.toggle(this.props.item._id, section);
  }

  render () {

    const { item, panel } = this.props;

    const buttons = [
      (
        <ButtonGroup>
          <Button small shy onClick={ this.toggle.bind(this, 'promote') } className="item-promotions">
            <span>{ item.promotions } </span>
            <Icon icon="bullhorn" />
          </Button>
        </ButtonGroup>
      ),

      (
        <ButtonGroup>
          <Button small shy onClick={ this.toggle.bind(this, 'details') } className="toggle-details">
            <span>{ item.popularity.number + '%' } </span>
            <Icon icon="signal" />
          </Button>
        </ButtonGroup>
      )
    ];

    let subtype, harmony;

    if ( item.subtype && item.children ) {
      subtype = (
        <Button small shy onClick={ this.toggle.bind(this, 'subtype') } className="subtype-button">
          <span>{ item.children } </span>
          <Icon icon="fire" />
        </Button>
      );
    }

    if ( item.harmony && item.harmony.harmony ) {
      harmony = (
        <Button
          small
          shy
          onClick     =   { this.toggle.bind(this, 'harmony') }
          className   =   "harmony-button"
          >
          <span>{ item.harmony.harmony } </span>
          <Icon icon="music" />
        </Button>
      );
    }

    buttons.push(
      <ButtonGroup>
        { subtype }
        { harmony }
      </ButtonGroup>
    );

    return (<section>{ buttons }</section>);
  }
}

export default ItemButtons;
