'use strict';

import React                          from 'react';
import Select                         from './util/select';


class PoliTendSelector extends React.Component {


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  setTendency () {
    console.info("PoliTendSelector.setTendency");
    const tendency = React.findDOMNode(this.refs.tendency).value;

    if ( tendency ) {

      if(this.props.changeHandler) {
        this.props.changeHandler(tendency);
      } else {
        window.socket.emit('set user info', { tendency });
      }
    }
  }
   //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  render () {
    console.info("PoliTendSelector.render:",this);
    let { valueDefault } = this.props;
    if(!(window.Synapp && window.Synapp.tendencyChoice)) {console.info("PoliTendSelector: tendencyChoice not ready yet"); return ({}); }

    const tendencyChoice = window.Synapp.tendencyChoice;

    let tendency = tendencyChoice.map(tendency => (
      <option value={ tendency._id } key={ tendency._id }>{ tendency.name }</option>
    ));

    return (
      <section>
        <Select block medium ref="tendency" defaultValue={ valueDefault } onChange={ this.setTendency.bind(this) }>
            <option value=''>Choose one</option>
            { tendency }
        </Select>
      </section>
    );
  }
}

export default PoliTendSelector; 
