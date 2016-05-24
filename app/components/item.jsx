'use strict';

import React from 'react';
import ItemMedia        from './item-media';

class Item extends React.Component {

  constructor (props) {
    super(props);

    this.state = { userInfo : null };

    this.getUserInfo();
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   *  @description      Break a given text into lines, themselves into words
   *  @arg              {String} text
   *  @return           [[String]]
  */
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  static wordify (text) {
    let lines = [];

    text.split(/\n/).forEach(line => lines.push(line.split(/\s+/)));

    lines = lines.map(line => {
      if ( line.length === 1 && ! line[0] ) {
        return [];
      }
      return line;
    });

    return lines;
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   *  @description      Put all words into spans, hidding the ones who are below limit
   *  @arg              {HTMLElement} container
   *  @arg              {Number} limit
   *  @return           null
  */
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  static paint (container, limit) {

    const lines           =   Item.wordify(container.textContent);
    container.innerHTML   =   '';

    const whiteSpace      =   () => {
      const span          =   document.createElement('span');

      span.appendChild(document.createTextNode(' '));

      return span;
    }

    lines.forEach(line => {
      const div = document.createElement('div');

      container.appendChild(div);

      line.forEach(word => {
        const span = document.createElement('span');

        span.appendChild(document.createTextNode(word));

        span.classList.add('word');

        div.appendChild(span);

        div.appendChild(whiteSpace());

        const offset = span.offsetTop;

        if ( offset > limit ) {
          span.classList.add('hide');
        }
      });
    });
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  componentDidMount () {
    if ( this.refs.item ) {
      let media;

      const image = React
        .findDOMNode(this.refs.media)
        .querySelector('img');

      const video = React
        .findDOMNode(this.refs.media)
        .querySelector('iframe');

      if ( video ) {
        media = React
         .findDOMNode(this.refs.media)
         .querySelector('.video-container');
      }
      else if (image) {
        media = image;
      }

      const item = React
        .findDOMNode(this.refs.item);

      if ( ! this.truncated ) {
        const more = React.findDOMNode(this.refs.more);

        let truncatable   =   item.querySelector('.item-truncatable');
        // let subject       =   item.querySelector('.item-subject a');
        let subject       =   item.querySelector('.item-subject');
        let description   =   item.querySelector('.item-description');
        let reference     =   item.querySelector('.item-reference a');
        let buttons       =   item.querySelector('.item-buttons');
        let tendency      =   item.querySelector('.item-tendency');

        let onLoad = () => {
          let mediaHeight = 50; // minimum height for the item
          if (media) {
              mediaHeight = ( media.offsetTop + media.offsetHeight - 40 );
          }

          let limit;

          if ( ! buttons ) {
            limit = mediaHeight;
          }

          else {
            let buttonsHeight = ( buttons.offsetTop + buttons.offsetHeight - 40 );

            if ( mediaHeight >= buttonsHeight  ) {
              limit = mediaHeight;
            }

            else {
              limit = buttonsHeight;
            }
          }

          Item.paint(subject, limit);
          Item.paint(reference, limit);
          Item.paint(description, limit);
          Item.paint(tendency, limit);

          if ( ! item.querySelector('.word.hide') ) {
            more.style.display = 'none';
          }

          if ( this.props.new ) {
            this.setState({ showPromote: true });
          }
        };

        if ( image ) {
          if ( image.complete && image.naturalWidth ) {
            onLoad();
          }

          else {
            image.addEventListener('load', onLoad);
          }
        }
        else {
          onLoad();
          // video.addEventListener('load', onLoad);
        }

        this.truncated = true;
      }
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  readMore (e) {
    e.preventDefault();

    let truncatable =  React.findDOMNode(this.refs.item)
      .querySelector('.item-truncatable');

    truncatable.classList.toggle('expand');

    this.expanded = ! this.expanded;

    let text = React.findDOMNode(this.refs.readMoreText);

    if ( this.expanded ) {
      text.innerText = 'less';
    }
    else {
      text.innerText = 'more';
    }
  }


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 getUserInfo () {
    if ( typeof window !== 'undefined' ) {
      console.info("item.getUserInfo.promise");
      Promise
        .all([
          new Promise((ok, ko) => {
            window.socket.emit('get user info', ok);
          }),
          new Promise((ok, ko) => {
            window.socket.emit('get political tendency', ok)
          })
        ])
        .then(
          results => {
            let [ userInfo, politicalTendency ] = results;
            this.setState({ userInfo, politicalTendency });
          }
        );
    }
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  render () {
    const { item, user, buttons, footer, collapsed } = this.props;

    const tendencyChoice = [];

    console.info("item.render", this.state, this.state.politicalTendency ? "tendency true " : "tendency false");
    if(this.state.politicalTendency) {
      this.state.politicalTendency.forEach( choice => {
        console.info("item in loop", choice );
        tendencyChoice[choice._id]=choice.name;
      } );
    }


    console.info("item.render:", this.props, this.state, tendencyChoice);

    let rendereditem = {};

    let referenceLink, referenceTitle;

    if ( item.references && item.references.length ) {
      referenceLink = item.references[0].url;
      referenceTitle = item.references[0].title;
    }

    if(collapsed==true) {
      rendereditem = (
        <article className="item" ref="item" id={ `item-${item._id}` }  style={{ display : 'none' }} >
          <ItemMedia
            item      =   { item }
            ref       =   "media"
            />

          <section className="item-buttons">
            { buttons }
          </section>

          <section className="item-text">
            <div className="item-truncatable">
              <h4 className="item-subject">
                { /*<Link href={ item.link } then={ this.selectItem.bind(this) }>{ item.subject }</Link> */ }
                { item.subject }
              </h4>
              <h5 className="item-reference" style={ item.references && item.references.length ? { display : 'block' } : { display : 'none' } } >
                <a href={ referenceLink } target="_blank" rel="nofollow">{ referenceTitle }</a>
              </h5>
              <div className="item-description pre-text">{ item.description }</div>
              <div className="item-tendency" style={ this.state.userInfo && this.state.userInfo.tendency ? { display : 'block' } : { display : 'none' } } >
                { this.state.userInfo && this.state.userInfo.tendency ? tendencyChoice[this.state.userInfo.tendency]  :  '' }
              </div>
              <div className="item-read-more" ref="more">
                <a href="#" onClick={ this.readMore.bind(this) }>Read <span ref="readMoreText">more</span></a>
              </div>
            </div>
          </section>

          <section style={ { clear : 'both' }}></section>

          <section style={{ marginRight : '0px' }}>
            { footer }
          </section>
        </article>
      );
    } else {
      rendereditem = (
        <article className="item" ref="item" id={ `item-${item._id}` }>
          <ItemMedia
            item      =   { item }
            ref       =   "media"
            />

          <section className="item-buttons">
            { buttons }
          </section>

          <section className="item-text">
            <div className="item-truncatable">
              <h4 className="item-subject">
                { /*<Link href={ item.link } then={ this.selectItem.bind(this) }>{ item.subject }</Link> */ }
                { item.subject }
              </h4>
              <h5 className="item-reference" style={ item.references && item.references.length ? { display : 'block' } : { display : 'none' } } >
                <a href={ referenceLink } target="_blank" rel="nofollow">{ referenceTitle }</a>
              </h5>
              <div className="item-description pre-text">{ item.description }</div>
                <div className="item-tendency" style={ this.state.userInfo && this.state.userInfo.tendency ? { display : 'block' } : { display : 'none' } } >
                  - { this.state.userInfo && this.state.userInfo.tendency ? tendencyChoice[this.state.userInfo.tendency]  :  '' }
                </div>
              <div className="item-read-more" ref="more">
                <a href="#" onClick={ this.readMore.bind(this) }>Read <span ref="readMoreText">more</span></a>
              </div>
            </div>
          </section>

          <section style={ { clear : 'both' }}></section>

          <section style={{ marginRight : '0px' }}>
            { footer }
          </section>
        </article>
      );
    }
    return (  rendereditem );
  }
}

export default Item;
