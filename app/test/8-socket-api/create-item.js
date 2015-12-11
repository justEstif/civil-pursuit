'use strict';

import describe                   from 'redtea';
import should                     from 'should';
import mock                       from '../../lib/app/socket-mock';
import createItem                 from '../../api/create-item';
import isUser                     from '../../lib/assertions/is-user';
import User                       from '../../models/user';
import isItem                     from '../../lib/assertions/is-item';
import Item                       from '../../models/item';
import Type                       from '../../models/type';
import isType                     from '../../lib/assertions/is-type';
import isPanelItem                from '../../lib/assertions/is-panel-item';

function test (props) {
  const locals = {};

  return describe ( ' API / Create Item', [
    {
      'Type' : [
        {
          'should get random type' : (ok, ko) => {
            Type.findOneRandom().then(
              type => {
                locals.type = type;
                ok();
              },
              ko
            );
          }
        },
        {
          'should be a type' : describe.use(() => isType(locals.type))
        }
      ]
    },
    {
      'Create item' : (ok, ko) => {
        locals.candidate = {
            subject : 'Item created via socket',
            description : 'Some description here',
            type : locals.type
        };

        mock(props.socket, createItem, 'create item', locals.candidate)
          .then(
            item => {
              locals.item = item;
              ok();
            },
            ko
          );
      }
    },
    {
      'should be a panel item' : describe.use(() => {
        return isPanelItem(locals.item);
      })
    },
    {
      'Verify in DB' : [
        {
          'Get item again' : (ok, ko) => {
            Item.findById(locals.item).then(
              item => {
                locals.item = item;
                ok();
              },
              ko
            );
          }
        },
        {
          'should be an item' : describe.use(() => isItem(locals.item))
        }
      ]
    }
  ]);
}

export default test;