'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import ItemMedia        from './item-media';
import Icon               from './util/icon';
import Accordion          from './util/accordion';
import ClassNames          from 'classnames';
import VisualState     from './visual-state';
import isEqual from 'lodash/isEqual';
import has from 'lodash/has';

//Item Visual State - lets other components change the visual state of an item. 
// For example 'collapsed' is a visual state.  But as we grow the use of Item we find that there are more visual states and we even want to change the visual state of an item based on it's depth.

class Item extends React.Component {
  render(){
 //   console.info("Item render");
    return (
    <VisualState {... this.props}>
      <VSItem />
    </VisualState>
    );
  }
}
export default Item;

class VSItem extends React.Component {  

  state={hint: false, minHeight: null}; //

  constructor(props){
    super(props);
    //this.state.hint = (this.props.vs.state==='truncated');  // check this after the component did mount
//    console.info("VSItem constructor");
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  transparentEventListener= {};
  transparent(e){
    e.preventDefault();
  }


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  componentDidMount () {

    this.transparentEventListener=this.transparent.bind(this);
    var truncable=ReactDOM.findDOMNode(this.refs.truncable);
    if(truncable){ // if item is null, only a simple div is returned.
      truncable.addEventListener('mouseover', this.transparentEventListener, false);
      truncable.addEventListener('click', this.transparentEventListener, false);
      this.textHint(); //see if we need to give a hint
    }
  }

  componentWillUnmount(){ // if item is null, only a simple div is returned.
    var truncable=ReactDOM.findDOMNode(this.refs.truncable);
    if(truncable){
    truncable.removeEventListener('mouseover', this.transparentEventListener);
    truncable.removeEventListener('click', this.transparentEventListener);
    }
  }

/*** This could work really well - but we need a few more event updates based on button changes, and on footer changes **/
  shouldComponentUpdate(newProps,newState){
    let a = has(this.props,'buttons.props.children.props.buttonstate'),
        b = has(newProps,  'buttons.props.children.props.buttonstate');
    if(a != b) return true;
    if(this.props.vs.state !== newProps.vs.state) return true;
    if(this.state.hint !== newState.hint) return true;
    if(this.state.minHeight != newState.minHeight) return true;
    if(this.props.item && newProps.item) {
      if(this.props.item.subject !== newProps.item.subject) return true;
      if(this.props.item.description !== newProps.item.description) return true;
      if(!( a && b && isEqual(this.props.buttons.props.children.props.buttonstate, newProps.buttons.props.children.props.buttonstate)
           )
       ) return true;
    }
 //   console.info("item shouldn't update");
    return false;
  }
  /***/



  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  textHint() {
    //called on mount and completion of Accordion collapse / expand
    //active when the accordion has completed open, not active when accordion has completed close. But that doesn't matter here. Parent is the master of the state.
    console.info("textHint before", this.state);

    if(this.props.vs.state==='truncated') { 
      let buttonsR=this.refs.buttons.getBoundingClientRect();
      let mediaR = ReactDOM.findDOMNode(this.refs.media).getBoundingClientRect();
      let truncable = ReactDOM.findDOMNode(this.refs.truncable);
      let innerChildR=truncable.children[0].getBoundingClientRect(); // first child of according is a div which wraps around the innards and is not constrained by min/max height
      let bottomLine=Math.max(buttonsR.bottom,mediaR.bottom);
      if(  (( buttonsR.height ||  mediaR.height) && (innerChildR.bottom < bottomLine)) // there is less text than the bottom of media or button
      ||   (((!buttonsR.height && !mediaR.height) || this.props.min) && (innerChildR.bottom < truncable.getBoundingClientRect().bottom)) // there is no media or buttons and there is less text than the 'min' height of truncated
      ){
        if(!this.props.position) { 
//          truncable.style.minHeight= innerChildR.height +'px';  // if the actual size of item-text is less than the button group or media, set it to the button group and don't show the hint.
          if(this.state.minHeight !== innerChildR.height+'px') this.setState({minHeight: innerChildR.height+'px'});  // child hieight might change after data is loaded, set state so component should update.
        }
        if(this.state.hint) this.setState({hint: false}); // if the hint is on - turn it off
        return;
      } else { // we are in the truncated state and there is so much text that we need to truncate it
        if(!this.state.hint) this.setState({ hint: true } ); // if the text is bigger, turn on the hint
      }
    } else { // if this is not the truncated state, make sure the hint is off
      if(this.state.hint) this.setState({hint: false}); // if open, turn off the hint
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  readMore (e) {
   e.preventDefault(); // stop the default event processing of a div which is to stopPropogation
   // e.stopPropagation(); // do not stop propogation so this event will propogate to the item-button
      console.info("Item.readMore", e);
      let item = this.refs.item;
      if (this.props.vs.state==='truncated') {
        this.setState({hint: false});  // turn off the hint at the beginning of the sequence
        if(this.props.focusAction){this.props.focusAction(true)}
        if(this.props.vs.toParent){this.props.vs.toParent(Object.assign({},this.props.vs,{state: 'open', distance: 0}))}
        if(this.props.toggle) this.props.toggle(this.props.item._id, 'harmony');  // if open show harmony
      } else {
        if(this.props.toggle) this.props.toggle(this.props.item._id, 'harmony'); // if closed don't show harmony
        if(this.props.vs.toParent){this.props.vs.toParent(Object.assign({},this.props.vs,{state: 'truncated', distance: 0}))}
        if(this.props.focusAction){this.props.focusAction(false)}
      }
  }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  openURL (e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if(this.props.vs.state==='truncated') { return this.readMore(e); }

    let win = window.open(this.refs.link.href, this.refs.link.target);
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  render () {
    const { item, user, buttons, footer, vs } = this.props;
    const vState=vs ? vs.state : '';
    const cState= vState ? 'vs-'+vState : '';
    
    let noReference=true;

 //   console.info("VSItem render");

    if(!item) {return (<div style={{textAlign: "center"}}>Nothing available at this time.</div>);}

    const tendencyChoice = null;

    if(typeof window !== 'undefined' ) {
        window.Synapp.tendencyChoice
    };

    let rendereditem = {};

    let referenceLink, referenceTitle;

    if ( item.references && item.references.length ) {
      referenceLink = item.references[0].url;
      referenceTitle = item.references[0].title;
      noReference=false;
    }

      rendereditem = (
        <Accordion active={vState!=='collapsed'} name='item'>
          <article className={ClassNames("item", this.props.className, cState )} ref="item" id={ `item-${item._id}` } >
            <Accordion active={vState!=='ooview'}>
              <ItemMedia className={cState} onClick={ this.readMore.bind(this) }
                item      =   { item }
                ref       =   "media"
              />
              <section className={ClassNames("item-text", cState)} ref='itemText'>
                <section className={ClassNames("item-buttons", cState)} ref='buttons'>
                  { buttons }
                </section>
                <Accordion className={ClassNames("item-truncatable", cState)} onClick={ this.readMore.bind(this) } active={ vState==='open' } text={ true } onComplete={ this.textHint.bind(this) } ref='truncable' style={{minHeight: this.state.minHeight}}>  
                  <h4 className={ClassNames("item-subject",cState)} ref='subject'>
                    { /*<Link href={ item.link } then={ this.selectItem.bind(this) }>{ item.subject }</Link> */ }
                    { item.subject }
                  </h4>
                  <h5 className={ClassNames('item-reference', cState, {none: noReference})} ref='reference' >
                    <a href={ referenceLink } onClick={ this.openURL.bind(this) } ref="link" target="_blank" rel="nofollow"><span>{ referenceTitle }</span></a>
                  </h5>
                  <div className={ClassNames('item-description', 'pre-text', vState === 'truncated' ? (noReference ? 'vs-truncated4' : 'vs-truncated') : cState)} ref='description'>
                    { item.description }
                  </div>
                  <div className="item-tendency" style={{display: 'none'}}>
                      { tendencyChoice && item && item.user && item.user.tendency ? '-' + tendencyChoice[item.user.tendency]  :  '' }
                  </div>
                </Accordion>
              </section>
              <div className={ClassNames('item-trunc-hint', {expand: this.state.hint}, cState)}>
                  <Icon icon="ellipsis-h" />
              </div>
            </Accordion>
            <section style={ { clear : 'both' }}></section>
            <section style={{ marginRight : '0px' }}>
              { footer }
            </section>
          </article>
        </Accordion>
      );
    return (  rendereditem );
  }
}
