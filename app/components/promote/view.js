'use strict';

import {Element, Elements} from 'cinco/dist';

class Promote extends Element {

  constructor (props) {
    super('section');

    this.props = props || {};

    this.add(
      this.compose()
    );
  }

  promoteImage (hand) {
    return new Element('.image.gutter-right.gutter-bottom', {
      style         :   'float: left; width: 40%',
      className     :   [hand + '-item']
    });
  }

  promoteSubject (hand) {
    return new Element('.subject', {
      className    :   [hand + '-item']
    }).add(new Element('h4'));
  }

  promoteDescription (hand) {
    return new Element('.description.gutter-right.pre-text', {
      className    :   [hand + '-item']
    });
  }

  promoteReference (hand) {
    return new Element('.references.gutter-right', {
      className    :   [hand + '-item']
    }).add(new Element('a', {
      rel       :   'nofollow',
      target    :   '_blank'
    }));
  }

  promoteSliders (hand) {

    let sliders = new Element('.sliders', {
      className:  [hand + '-item']
    });

    for ( let i = 0; i < 4; i ++ ) {
      let slider = new Element('.criteria-wrapper.criteria-' + i);

      slider.add(new Element('.row').add(
        new Element('.tablet-40').add(
          new Element('h5.criteria-button-title').add(
            new Element('button.criteria-name.shy.block.text-left')
              .text('Criteria')
          )
        ),

        new Element('.tablet-60', {
          style: 'margin-top: 0.5em'
        }).add(
          new Element('input.block', {
            type: 'range',
            min: '-1',
            max: '1',
            value: '0',
            step: '1'
          })
        )
      ));

      slider.add(new Element('h5.criteria-description.row.watch-100.gutter'));

      sliders.add(slider);
    }

    return sliders;
  }

  promoteFeedback (hand) {
    return new Element('.feedback', {
      className    :   [hand + '-item']
    }).add(
      new Element('textarea.feedback-entry.block', {
        placeholder : 'Can you provide feedback that would encourage the author to create a statement that more people would unite around?'
      })
    );
  }

  promoteButton (hand) {
    return new Element('.gutter-bottom.gutter-right', {
      className    :   [hand + '-item']
    }).add(
      new Element('button.block.promote').text('Promote')
    );
  }

  editAndGoAgain (hand) {
    return new Element('.gutter-bottom.gutter-right', {
      className    :   [hand + '-item']
    }).add(
      new Element('button.block.edit-and-go-again-toggle')
        .text('Edit and go again')
    );
  }

  compose () {

    let leftImage = this.promoteImage('left');

    leftImage.addClass('.gutter-left');

    return new Elements().add(
      
      new Element('header.promote-steps').add(
        new Element('h2').add(
          new Element('span.cursor').text('1'),
          new Element('span').text(' of '),
          new Element('span.limit').text('5')
        ),

        new Element('h4').text('Evaluate each item below')
      ),

      new Element('.items-side-by-side').add(
        // 1 column
        new Element('.split-hide-up').add(
          this.promoteImage('left'),
          this.promoteSubject('left'),
          this.promoteDescription('left'),
          this.promoteReference('left'),
          this.promoteSliders('left'),
          this.promoteFeedback('left'),
          this.promoteButton('left'),
          this.editAndGoAgain('left'),

          this.promoteImage('right'),
          this.promoteSubject('right'),
          this.promoteDescription('right'),
          this.promoteReference('right'),
          this.promoteSliders('right'),
          this.promoteFeedback('right'),
          this.promoteButton('right'),
          this.editAndGoAgain('right')
        ),

        // 2 columns
        new Element('.split-hide-down.gutter-left').add(
          new Element('.row.items-to-evaluate').add(
            new Element('.split-50.watch-100').add(
              leftImage,
              this.promoteSubject('left'),
              this.promoteDescription('left')
            ),

            new Element('.split-50.watch-100').add(
              this.promoteImage('right'),
              this.promoteSubject('right'),
              this.promoteDescription('right')
            )
          ),

          new Element('.row.item-references-evaluate').add(
            new Element('.split-50.watch-100').add(
              this.promoteReference('left')
            ),

            new Element('.split-50.watch-100').add(
              this.promoteReference('right')
            )
          ),

          new Element('.row').add(
            new Element('.split-50.watch-100').add(
              this.promoteSliders('left')
            ),

            new Element('.split-50.watch-100').add(
              this.promoteSliders('right')
            )
          ),

          new Element('.row').add(
            new Element('.split-50.watch-100').add(
              this.promoteFeedback('left')
            ),

            new Element('.split-50.watch-100').add(
              this.promoteFeedback('right')
            )
          ),

          new Element('h5.text-center.promote-label-choose').text('Which of these is most important for the community to consider?'),

          new Element('.row').add(
            new Element('.split-50.watch-100').add(
              this.promoteButton('left')
            ),

            new Element('.split-50.watch-100').add(
              this.promoteButton('right')
            )
          ),

          new Element('.row').add(
            new Element('.split-50.watch-100').add(
              this.editAndGoAgain('left')
            ),

            new Element('.split-50.watch-100').add(
              this.editAndGoAgain('right')
            )
          )
        ),

        new Element('button.finish.block').text('Neither')
      )

    );
  }

}

export default Promote;
