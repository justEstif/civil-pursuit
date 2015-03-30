/***


         @\_______/@
        @|XXXXXXXX |
       @ |X||    X |
      @  |X||    X |
     @   |XXXXXXXX |
    @    |X||    X |             V
   @     |X||   .X |
  @      |X||.  .X |                      V
 @      |%XXXXXXXX%||
@       |X||  . . X||
        |X||   .. X||                               @     @
        |X||  .   X||.                              ||====%
        |X|| .    X|| .                             ||    %
        |X||.     X||   .                           ||====%
       |XXXXXXXXXXXX||     .                        ||    %
       |XXXXXXXXXXXX||         .                 .  ||====% .
       |XX|        X||                .        .    ||    %  .
       |XX|        X||                   .          ||====%   .
       |XX|        X||              .          .    ||    %     .
       |XX|======= X||============================+ || .. %  ........
===== /            X||                              ||    %
                   X||           /)                 ||    %
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Nina Butorac

                                                                             
                                                                       

         $$$$$$$  $$    $$  $$$$$$$    $$$$$$    $$$$$$    $$$$$$ 
        $$        $$    $$  $$    $$        $$  $$    $$  $$    $$
         $$$$$$   $$    $$  $$    $$   $$$$$$$  $$    $$  $$    $$
              $$  $$    $$  $$    $$  $$    $$  $$    $$  $$    $$
        $$$$$$$    $$$$$$$  $$    $$   $$$$$$$  $$$$$$$   $$$$$$$ 
                        $$                      $$        $$      
                        $$                      $$        $$     
                   $$$$$$                       $$        $$                     


**/

! function () {
  
  'use strict';

  /**
   * The Item Model
   * 
   * @class ItemSchema
   * @author francoisrvespa@gmail.com
  */

  var config        =     require('../config.json');

  var path          =     require('path');

  var mongoose      =     require('mongoose');

  var Schema        =     mongoose.Schema;

  var User          =     require('./User');

  var ItemSchema    =     new Schema(require('./Item/schema'));

  ItemSchema.plugin(require('mongoose-simple-random'));

  // PRE INIT
  // ========

  ItemSchema.post( 'init', function postInit () {
    this._original = this.toObject();
  });

  // PRE VALIDATE
  // ============

  ItemSchema.pre('validate', function preValidate (next) {
  /*  if ( this.isNew && this.parent ) {
      this.parent = Schema.Types.ObjectId(this.parent);
    }*/
    return next();
  });

  // PRE SAVE
  // ========

  ItemSchema.pre('save', require('./Item/pre.save'));

  /** Evaluate item against 5 others...
   *
   *  @method ItemSchema.evaluate
   *  @param {String} id - The Item to update Object Id
   *  @param {updateById~cb} cb - The callback
   *  @return {Object}
   */

  ItemSchema.statics.evaluate = require('./Item/evaluate');

  /** Fetch item's related data, namely votes and feedbacks ...
   *
   *  @method ItemSchema.details
   *  @param {String} id - The Item to update Object Id
   *  @param {updateById~cb} cb - The callback
   *  @return {Object}
   */

  ItemSchema.statics.details = require('./Item/details');

  // Increment view

  ItemSchema.statics.incrementView = require('./Item/incrementView');

  // Increment promotion

  ItemSchema.statics.incrementPromotion = require('./Item/incrementPromotion');

  // Get item's lineage

  ItemSchema.statics.getLineage = require('./Item/get-lineage')

  // 

  // EXPORT
  // ======

  var Item = module.exports = mongoose.model('Item', ItemSchema);

} ();
