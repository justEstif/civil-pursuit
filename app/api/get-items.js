'use strict';

import Item from '../models/item';

function getItems (event, panel, item) {
  try {
    let id      =   'panel-' + panel.type._id || panel.type;
    const query   =   { type : panel.type._id || panel.type};

    if ( panel.parent ) {
      id += '-' + panel.parent;
      query.parent = panel.parent;
    }

    if ( panel.skip ) {
      query.skip = panel.skip;
    }

    Item
      .getPanelItems(query)
      .then(
        results => {
          try {
            this.ok(event, panel, results.count, results.items);
          }
          catch ( error ) {
            ko(error);
          }
        },
        this.error.bind(this)
      );
  }

  catch ( error ) {
    this.error(error);
  }

}

export default getItems;