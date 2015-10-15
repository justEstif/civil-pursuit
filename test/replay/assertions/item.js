'use strict';

import should from 'should';
import Mung from '../../../app/lib/mung';
import Item from '../../../app/models/item';
import Type from '../../../app/models/type';
import User from '../../../app/models/user';

should.Assertion.add('item', function (candidate = {}) {
  this.params = { operator: 'to be an Item', expected: Item };

  this.obj.should.be.an.Object();

  this.obj.should.be.an.instanceof(Item);

  this.obj.should.have.property('_id')
    .which.is.an.instanceof(Mung.ObjectID);

  this.obj.should.have.property('type')
    .which.is.an.instanceof(Mung.ObjectID);

  if ( 'type' in candidate ) {
    if ( candidate.type instanceof Type ) {
      candidate.type._id.should.be.exactly(this.obj.type);
    }
    else {
      throw new Error('Type mismatch');
    }
  }

  this.obj.should.have.property('id')
    .which.is.a.String();

  if ( 'id' in candidate ) {
    this.obj.id.should.be.exactly(candidate.id);
  }

  this.obj.should.have.property('subject')
    .which.is.a.String();

  if ( 'subject' in candidate ) {
    this.obj.subject.should.be.exactly(candidate.subject);
  }

  this.obj.should.have.property('description')
    .which.is.a.String();

  if ( 'description' in candidate ) {
    this.obj.description.should.be.exactly(candidate.description);
  }

  this.obj.should.have.property('user')
    .which.is.an.instanceof(Mung.ObjectID);

  if ( 'user' in candidate ) {
    if ( candidate.user instanceof User ) {
      this.obj.user.equals(candidate.user._id).should.be.true;
    }
    else {
      throw new Error("Item's candidate user is different from item document's user");
    }
  }

  this.obj.should.have.property('promotions')
    .which.is.a.Number();

  if ( 'promotions' in candidate ) {
    this.obj.promotions.should.be.exactly(candidate.promotions);
  }

  this.obj.should.have.property('views')
    .which.is.a.Number();

  if ( 'views' in candidate ) {
    this.obj.views.should.be.exactly(candidate.views);
  }

  if ( 'image' in this.obj ) {
    this.obj.image.should.be.a.String();
  }

  if ( 'image' in candidate ) {
    this.obj.image.should.be.exactly(candidate.image);
  }

  if ( 'references' in this.obj ) {
    this.obj.references.should.be.an.Array();

    this.obj.references.forEach(reference => {
      reference.should.be.an.Object();

      reference.should.have.property('url')
        .which.is.a.String();

      if ( 'title' in reference ) {
        reference.title.should.be.a.String();
      }
    });
  }

  if ( 'references' in candidate ) {
    this.obj.references.should.be.exactly(candidate.references);
  }

  if ( 'parent' in this.obj ) {
    this.obj.parent.should.be.an.instanceof(mongodb.ObjectID);
  }

  if ( 'parent' in candidate ) {
    this.obj.parent.should.be.exactly(candidate.parent);
  }

  if ( 'from' in this.obj ) {
    this.obj.from.should.be.an.instanceof(mongodb.ObjectID);
  }

  if ( 'from' in candidate ) {
    this.obj.from.should.be.exactly(candidate.from);
  }
});
