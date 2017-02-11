'use strict';

import React from 'react';
import Panel from './panel';
import PanelStore from './store/panel';
import PanelItems from './panel-items';
import panelType from '../lib/proptypes/panel';
import QSortButtons from './qsort-buttons';
import ItemStore from '../components/store/item';
import update from 'immutability-helper';
import FlipMove from 'react-flip-move';
import QSortFlipItem from './qsort-flip-item'
import smoothScroll from '../lib/app/smooth-scroll';
import Instruction from './instruction';
import Color from 'color';
import Button           from './util/button';
import Item from './item';
import Creator            from './creator';
import QSortButtonList from './qsort-button-list';


class QSortWhy extends React.Component {

    static propTypes = {
        panel: panelType
    };

    ButtonList=[];

 

    buttons=[];

    motionDuration = 500; //500mSec

    state = {};
    results = {why: {}};
    currentTop = 0; //default scroll position
    scrollBackToTop = false;

    cloneSections(section) {
        // Deep copy arrays.
        var clone = {};
        Object.keys(section).forEach(button => {
            clone[button] = section[button].slice(0);
        });
        return clone;
    }

    whyName = '';

    constructor(props) {
        super(props);
        var unsortedList = [];
        console.info("qsortWhy constructor");
        this.ButtonList['unsorted']=QSortButtonList['unsorted'];
        if(this.props.type.name==="Why It's Most Important"){
            this.whyName='most';
        } else {
            this.whyName='least';
        }
        this.results.why[this.whyName]={};
        this.ButtonList[this.whyName]=QSortButtonList[this.whyName];
        console.info("qsort-why constructor buttonlist")
        this.buttons = Object.keys(this.ButtonList);
        this.state.sections = {};
        this.buttons.forEach(button => {
            this.state.sections[button] = [];
        });
        if(this.props.shared.sections[this.whyName]){ // if theres nothing in the list, there might not be a list especially for Least
            this.state.sections['unsorted'] = this.props.shared.sections[this.whyName].slice(0);
        } else this.state.sections['unsorted'] = [];
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  

    componentWillReceiveProps(newProps) { //items that are nolonger there will be removed, existing item section will be preserved, new items will be in unsorted.
        console.info("qsortWhy componentWillReceiveProps");
        var newSections=[];
        this.buttons.forEach(button=> newSections[button]=[] );

        if(newProps.shared.sections[this.whyName]){
            newProps.shared.sections[this.whyName].forEach(itemId=>{
                if(this.state.sections[this.whyName].includes(itemId)){ newSections[this.whyName].push(itemId)} 
                else{ newSections['unsorted'].push(itemId) }
            });
            this.setState({sections: newSections});
        }
    }


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    toggle(itemId, button, set, whyItemId) {
        console.info("QsortWhy");
        //find the section that the itemId is in, take it out, and put it in the new section. if set then don't toggle just set.
        let i;
        let done = false;
        var clone = {};
        if( button == "done"){
            if( this.props.next ){ 
                this.props.next(this.props.panelNum,"done", this.results)
            }
            return;
        }
        if(set==='set'){
            this.results.why[this.whyName][itemId]=whyItemId;
        }
        if (itemId && button && button !== 'harmony') {
            Object.keys(this.ButtonList).forEach(
                (sectionName) => {
                    if (!done && ((i = this.state.sections[sectionName].indexOf(itemId)) !== -1)) {
                        if (sectionName === button) {
                            if(set==='set') { // set means don't toggle it
                                clone[button]=this.state.sections[button].slice();
                                clone['unsorted']=this.state.sections['unsorted'].slice();
                                done=true;
                            } else {
                                //take the i'th element out of the section it is in and put it back in unsorted
                                clone[button] = update(this.state.sections[button], { $splice: [[i, 1]] });
                                clone['unsorted'] = update(this.state.sections['unsorted'], { $unshift: [itemId] });
                                done = true;
                            }
                        } else if (sectionName === 'unsorted') {
                            // it was in unsorted, so take it out and put it in the button's section
                            clone['unsorted'] = update(this.state.sections['unsorted'], { $splice: [[i, 1]] });
                            clone[button] = update(this.state.sections[button], { $unshift: [itemId] });
                            done = true;
                        } else { // the item is in some other sectionName and should be moved to this button's section
                            clone[sectionName] = update(this.state.sections[sectionName], { $splice: [[i, 1]] });
                            clone[button] = update(this.state.sections[button], { $unshift: [itemId] });
                            done = true;
                        }
                    } else if (sectionName != button) {  // copy over the other stction byt don't overwrite the one you are modifying
                        clone[sectionName] = this.state.sections[sectionName].slice();
                    }
                }
            );
            this.setState({ 'sections': clone });

            //this browser may scroll the window down if the element being moved is below the fold.  Let the browser do that, but then scroll back to where it was.
            //this doesn't happen when moveing and object up, above the fold. 
            var doc = document.documentElement;
            this.currentTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            this.scrollBackToTop = true;


        }

    }

    onFlipMoveFinishAll() {
        if (this.scrollBackToTop) {
            this.scrollBackToTop = false;
            setTimeout(() => { smoothScroll(this.currentTop, this.motionDuration * 1.5) }, 100);
        }
        if(this.props.onFinishAll){return this.props.onFinishAll()}
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    render() {

        const { user } = this.props;
        const { panel } = this.props.shared;

        const onServer = typeof window === 'undefined';

        let title = 'Loading items', name, loaded = false, content = [], loadMore,
            type, parent, items, direction = [], instruction = [], issues = 0, done = [], loading=[];

        if (panel) {
            items = panel.items;
            loaded = true;

            type = this.props.type || panel.type;  // if a type was passed, use that one rather than the panel type. We are operating on the parents matching items not ours

            parent = panel.parent;

            if (type) {
                name = `syn-panel-${type._id}`;
            } else {
                name = 'syn-panel-no-type';
            }

            if (parent) {
                name += `-${parent._id || parent}`;
            }

            title = type.name;

            if (type && type.instruction) {
                instruction = (
                    <Instruction >
                        {type.instruction}
                    </Instruction>
                );
            }

            if ( ! (this.props.shared && this.props.shared.sections && this.props.shared.sections[this.whyName] && Object.keys(this.props.shared.sections[this.whyName].length))) {
                // if we don't have any data to work with 
                <div className='instruction-text' style={{backgroundColor: this.ButtonList['unsorted'].color, color: Color(this.ButtonList['unsorted'].color).negate}}>
                     No values were tagged ${this.whyName} Imortant. You could go back to Public Values and change that or you can contine.
                </div>
            } else {
                this.buttons.forEach((name) => {
                    if (this.state.sections['unsorted'].length) { issues++ }
                    let qb = this.ButtonList[name];
                    if (qb.max) {
                        console.info("QSortWhy qb")
                        if (this.state.sections[name].length > qb.max) {
                            direction.push(
                                <div className='instruction-text' style={{ backgroundColor: Color(qb.color).darken(0.1) }}>
                                    {qb.direction}
                                </div>
                            )
                            issues++;
                        }
                    }
                    this.state.sections[name].forEach(itemId => {
                        var buttonstate = {};
                        this.buttons.slice(1).forEach(button => { buttonstate[button] = false; });
                        if (name != 'unsorted') { buttonstate[name] = true; }
                        let item = items[this.props.shared.index[itemId]];
                        content.push(
                            {
                                sectionName: name,
                                user: user,
                                item: item,
                                toggle: this.toggle.bind(this, item._id, this.whyName), // were just toggleing most here
                                qbuttons: this.ButtonList,
                                buttonstate: buttonstate,
                                whyName: this.whyName,
                                id: item._id  //FlipMove uses this Id to sort
                            }
                        );
                    });
                });
            }
            if (!issues) {
                done.push(
                    <div className='instruction-text'>
                        {this.ButtonList['unsorted'].direction}
                        <Button small shy
                            onClick={this.toggle.bind(this, null, 'done')}
                            className="qwhy-done"
                            style={{ backgroundColor: Color(this.ButtonList['unsorted'].color).negate(), color: this.ButtonList['unsorted'].color, float: "right" }}
                            >
                            <span className="civil-button-text">{"next"}</span>
                        </Button>
                    </div>
                )
            }else {this.props.next(this.props.panelNum,"issues")}
        }


        return (
            <section id="syn-panel-qsort">
                <Panel
                    className={name}
                    ref="panel"
                    heading={[(<h4>{title}</h4>)]}
                    type={type}
                    >
                    {instruction}
                    {direction}
                    {done}
                    <div style={{ position: 'relative',
                                  display: 'block',
                    }}>
                        <div className="qsort-flip-move-articles">
                            <FlipMove duration={this.motionDuration} onFinishAll={this.onFlipMoveFinishAll.bind(this)} disableAllAnimations={onServer}>
                                {content.map(article => <QSortWhyItem {...article} key={article.id} />)}
                            </FlipMove>
                        </div>
                    </div>
                    {loading}
                </Panel>
            </section>
        );
    }
}

export default QSortWhy;

class QSortWhyItem extends React.Component {

    render(){
        const {qbuttons, sectionName, item, user, toggle, buttonstate, whyName } = this.props;
        var creator=[];
        const hIndex= (whyName === 'most') ? 0 : 1;

        if(item.harmony && item.harmony.types[hIndex]){
            creator=[
                <PanelStore type={ item.harmony.types[hIndex] } parent={ item } own={true} >
                    <QSortWhyCreate
                        user    =   { user }
                        type    =   { item.harmony.types[hIndex] }
                        parent  =   { item }
                        toggle  =  { toggle }
                        qbuttons = { qbuttons }
                        sectionName = { sectionName }
                    />
                </PanelStore >
            ];
        }

        return(
                <div style={{backgroundColor: qbuttons[sectionName].color}}>
                    <ItemStore item={ item } key={ `item-${item._id}` }>
                        <Item
                            item    =   { item }
                            user    =   { user }
                            footer= { creator }
                            vs={{state: 'truncated'}}
                            focusAction={null}
                            truncateItems={null}
                        />
                    </ItemStore>
                </div>
        );

    }
}

class QSortWhyCreate extends React.Component {
    set = false; // not part of state because we don't want to rerender on seting this. And once set, it's never changed.
    item = {};  // a local copy of the item data, passed up by the child. No need for it to be part of state - it's only being changed by the child. but we keep a copy here so we don't rerender null

    toMeFromChild(results){  // Creator (the child) passes back the data as it is entered. We store it in this.item in case we are asked to rerender
        Object.assign(this.item,results.item);
    }

    constructor(props){
        console.info("QSortWhyCreate.constructor", props);
        super(props);
        this.setItem(props);
    }

    componentWillReceiveProps(newProps){
        console.info("QSortWhyCreate.constructor", newProps);
        this.setItem(newProps);
    }

    setItem(props){
        const {type, parent, panel, toggle, qbuttons, sectionName, user } = props; // items is Object.assign'ed as a prop through PanelStore
        if(panel && panel.items && panel.items.length) {
            Object.assign(this.item,panel.items[0]);
            if(!this.set){ 
                this.set=true; 
                toggle('set', this.item._id); // passing the Id of the why item created
            }
        }
        console.info("QsortWhyCreate.setItem:", this.item);
    }

    render(){
        var result=[];
        var color='#fff'
        console.info("QSortWhyCreate");
        const {type, parent, panel, toggle, qbuttons, sectionName, user } = this.props; // items is Object.assign'ed as a prop through PanelStore

        if(sectionName=='unsorted' || !this.set ){
            color=qbuttons['unsorted'].color;
        } else {
            color=qbuttons[sectionName].color;
        }
        result = [  <Creator
                        type    =   { type }
                        parent  =   { parent }
                        item = { this.item }  
                        toggle = {toggle}
                        toParent = {this.toMeFromChild.bind(this)}
                   />
        ];
        return(
            <div style={{ backgroundColor: color,
                          marginBottom: '0.5em'}} >
                { result }
            </div>
        );
    }
}

