'use strict';

import sequencer from 'promise-sequencer';
import publicConfig from '../../../../public.json';

/**
 *  Return an object representing a batch of items with the following structure;
 *  { count : Number , items : [PanelItem] }
 *  @count
 *  The number of items loaded. This gets incremented every time a new panel is loaded (#TODO: do we really need that since we can do a `items.length`?)
 *  @items
 *  The loaded panel items in the batch
*/

function getPanelItems (panel, userId) {
  console.info("getPanelItems", panel, userId)
  const query = { type : panel.type };

  if ( panel.parent ) {
    query.parent = panel.parent;
  }

  const seq = [];

  seq.push(() => this.count(query));

  console.info("getPanelItems seq[0]", seq)

  seq.push(count => this.find(query)
    .skip(panel.skip || 0)
    .limit(panel.size || publicConfig['navigator batch size'])
    .sort({ promotions : -1, views : -1, _id : -1 })
  );

  seq.push(items => Promise.all(items.map(item => item.toPanelItem(userId))));

  console.info("getPanelItems before promise", seq);

  return new Promise((ok, ko) => {
    sequencer(seq)
      .then(results => ok({ count : results[0], items : results[2] }))
      .catch(ko);
  });
}

export default getPanelItems;
