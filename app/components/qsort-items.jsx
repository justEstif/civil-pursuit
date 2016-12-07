'use strict';

import React              from 'react';
import Panel              from './panel';
import Loading            from './util/loading';
import Link               from './util/link';
import panelType          from '../lib/proptypes/panel';
import makePanelId        from '../lib/app/make-panel-id';
import Join               from './join';
import Accordion          from './util/accordion';
import Promote            from './promote';
import EvaluationStore    from './store/evaluation';
import QSortButtons       from './qsort-buttons';
import Icon               from './util/icon';
import Creator            from './creator';
import ItemStore          from '../components/store/item';
import Details            from './details';
import DetailsStore       from './store/details';
import EditAndGoAgain     from './edit-and-go-again';
import Harmony            from './harmony';
import update             from 'immutability-helper';

class QSortItems extends React.Component {

  static propTypes  =   {
    panel           :   panelType
  };

  state = {sections: null};

  QSortButtonList = {
        unsorted: {
            name: 'unsorted',
            color: '#ffffff',
            title: {
                active: "Yea! this is in a stack",
                inactive: "Put this in in a stack"
            }

        },
        most: {
            name: 'most',
            color: '#f0f0ff',
            title: {
                active: "Yea! this is in the most important stack",
                inactive: "Put this in the most important stack"
            }

        },
        neutral: {
            name: 'neutral',
            color: '#f0f0f0',
            title: {
                active: "This is among the things that are neight most nor least important",
                inactive: "Put this among the things that are neight most nor least important"
            }
        },
        least: {
            name: 'least',
            color: '#fff0f0',
            title: {
                active: "This is in the least important stacko of them all",
                inactive: "Put this in the most important stack of them all"
            }
        }
    };
  
  sections = [];
  index = [];

//from http://stackoverflow.com/questions/25100714/for-a-deep-copy-of-a-javascript-multidimensional-array-going-one-level-deep-see
  cloneArray(arr) {  
    // Deep copy arrays. Going one level deep seems to be enough.
    var clone = [];
    for (i=0; i<arr.length; i++) {
        clone.push( arr[i].slice(0) )
    }
    return clone;
    }

  constructor(props){
      super(props);
      console.info("qsort constructor", this.QSortButtonList );
      let buttons = Object.keys(this.QSortButtonList);
      console.info("qsort buttons", buttons);
      buttons.forEach(button => this.sections[button]=[]);
      console.info("qsort section", this.sections);
      if(props.panel && props.panel.items) {
        props.panel.items.forEach((item,i) =>{
            this.sections['unsorted'].push(item._id);
            this.index[item._id]=i;
        });
      }
      this.setState({sections: this.sections} );
      console.info("qsort constructed");
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    componentWillReceiveProps(newProps){ //deleting items from sections that are nolonger in newProps is not a usecase
        let currentIndex = Object.entries(this.index);
        if(newProps.panel && newProps.panel.items) {
            newProps.panel.items.forEach((newItem,i) => {
                if(!(newItem.id in this.index)) {
                    this.sections['unsorted'].push(newItem._id);
                    this.index[newItem._id]=i;
                }else {
                    currentIndex[newItem.id]= -1; // items not marked -1 here should be deleted one day
                }
            });
        }
        this.setState({sections: {['unsorted']: this.sections['unsorted'].slice()}});
    }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  componentDidMount () {

  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  componentWillUnmount () {

  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  componentDidUpdate () {
  }


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  toggle (itemId, section) {
    //find the section that the itemId is in, take it out, and put it in the new section
    let i;
    let sectionsState=this.state.sections.slice()
    if ( itemId && section && section !=='harmony' ) {
        Object.keys(this.sections).forEach(
            (sectionName) => {
                if( (i = this.sections[sectionName].indexOf(itemId)) !== -1) {
                    if(sectionName === section ) { 
                        //take the i'th element out of the section it is in and put it back in unsorted
                        this.sections[sectionName].splice(i,1);
                        this.sections['unsorted'].unshift(itemId);
                        this.setState({sections: {[sectionName]: update(this.state.sections[sectionName], {$splice:  [[i,1]]  })}});
                        this.setState({sections: {['unsorted']:  update(this.state.sections['unsorted'],  {$unshift: [itemId] })}});
                        return;
                    } else { // take the i'th element out of the unsorted section and put it at the top of the new section
                        this.sections[sectionName].splice(i,1);
                        this.sections[section].unshift(itemId);
                        this.setState({sections: {['unsorted']: update(this.state.sections[sectionName], {$splice:  [[i,1]]  })}});
                        this.setState({sections: {[sectionName]: update(this.state.sections['unsorted'],  {$unshift: [itemId] })}});
                        return; //no need to continue, there's only one
                    }
                }
            }
        );
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  render () {

    const { panel, count, user, emitter } = this.props;

    let title = 'Loading items', name, loaded = false, content=[], loadMore,
      type, parent, items;

    if ( panel ) {
      items=panel.items;
      loaded = true;

      type = panel.type;
      parent = panel.parent;

      if(type) {
        name = `syn-panel-${type._id}`;
      } else
      { name = 'syn-panel-no-type';
      }

      if ( parent ) {
        name += `-${parent._id || parent}`;
      }

      title = type.name;

      if ( ! this.sections['unsorted'].length ) {
        content = (
          <div className="gutter text-center">
            <a href="#" onClick={ this.toggle.bind(this, null, 'creator') } className="click-to-create">
              Click the + to be the first to add something here
            </a>
          </div>
        );
      }

      else {
                Object.keys(this.sections).forEach((name) => {
                this.state.sections[name].forEach(itemId => {
                let buttonstate= {}
                Object.keys(this.QSortButtonList).slice(1).forEach(button => {buttonstate[button]=false;});
                let item = items[this.index[itemId]];

                content.push (
                    <div style={{backgroundColor: this.QSortButtonList[name].color}}>
                        <ItemStore item={ item } key={ `item-${item._id}` }>
                            <Item
                            item    =   { item }
                            user    =   { user }
                            buttons =   { (
                                <ItemStore item={ item }>
                                <QSortButtons
                                    item    =   { item }
                                    user    =   { user }
                                    toggle  =   { this.toggle.bind(this) }
                                    buttonstate = { buttonstate }
                                    qbuttons={ this.QSortButtonList }
                                    />
                                </ItemStore>
                            ) }
                            collapsed =  { false }  //collapsed if there is an active item and it's not this one
                            toggle  =   { this.toggle.bind(this) }
                            focusAction={this.props.focusAction}
                            truncateItems={this.props.resetView}
                            />
                        </ItemStore>
                    </div>
                );
            });
        });
      }
    }
   
        return (
        <section id               =     "syn-panel-qsort">
            <Panel
            className   =   { name }
            ref         =   "panel"
            heading     =   {[( <h4>{ title }</h4> )]}
            >
            { content }
            </Panel>
        </section>
        );
    }
}

export default QSortItems;

import Item from './item';
