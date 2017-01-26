'use strict';

import React                      from 'react';
import {JoinForm}                 from './join';
import Panel                      from './panel';

class LoginPanel extends React.Component {

  render () {
    const { panel, user, active } = this.props;

    if(user) {
            const newPanel={
                parent: panel.parent,
                type: panel.type.harmony[0],
                skip      :   0,
                limit     :   config['navigator batch size'],
              };
        return (
            <TypeComponent component={panel.type.component} { ...this.props } panel={newPanel} />
        )
    }

    let title = panel.type.name  || "User Registration Required";
    let instruction=panel.type.instruction || "This discussion requsts that all users be registered.";

    return (
        <Panel
          ref         =   "panel"
          heading     =   {[<h4>{ title }</h4>]}
        >
            <span>{instruction}</span>
            <JoinForm />
        </Panel>
      );
  }
}

export default LoginPanel;
