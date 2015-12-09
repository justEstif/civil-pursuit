'use strict';

import describe             from 'redtea';
import { Evaluation }       from '../app/evaluate';
import isType               from './is-type';
import isObjectID           from './is-object-id';
// import isItem               from './is-item';

function isEvaluation (evaluation, user, item, type, serialized = false) {
  return it => {

    it(serialized ? 'should be serialized' : 'should not be serialized', ok => ok());

    if ( serialized ) {
      it('should be an object', (ok, ko) => {
        evaluation.should.be.an.Object();
        ok();
      });
    }
    else {
      it('should be an Evaluation', (ok, ko) => {
        evaluation.should.be.an.instanceof(Evaluation);
        ok();
      });
    }

    it('split', [ it => {
      it('should have property split', (ok, ko) => {
        evaluation.should.have.property('split');
        ok();
      });

      it('split should match type', (ok, ko) => {
        type.isHarmony().then(
          isHarmony => {
            evaluation.split.should.be.exactly(isHarmony);
            ok();
          },
          ko
        );
      });
    }]);

    it('type', [ it => {
      it('should have property type', (ok, ko) => {
        evaluation.should.have.property('type');
        ok();
      });

      it('should be a type', describe.use(() => isType(evaluation.type, { _id : item.type })));
    }]);

    it('item', [ it => {
      it('should have property item', (ok, ko) => {
        evaluation.should.have.property('item');
        ok();
      });

      it('should be an object ID', describe.use(() => isObjectID(evaluation.item, item._id)));
    }]);

    it('items', [ it => {
      it('should have property items', (ok, ko) => {
        evaluation.should.have.property('items');
        ok();
      });
      it('should be an array', (ok, ko) => {
        evaluation.items.should.be.an.Array();
        ok();
      });
      it('should not have more than 6 items', (ok, ko) => {

      });
    }]);
  };
}

export default isEvaluation;
