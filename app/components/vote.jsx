'use strict';

import React                          from 'react';
import criteriaType                   from '../lib/proptypes/criteria';
import voteType                       from '../lib/proptypes/vote';
import itemType                       from '../lib/proptypes/item';
import Row                            from './util/row';
import Column                         from './util/column';
import Charts                         from './util/charts';
import Legend                         from './util/legend';

class Vote extends React.Component {

  state = { 
    itemId: null,
    total: null,
    data: [],
    series: ['France', 'Italy', 'England', 'Sweden', 'Germany'],
    labels: ['cats', 'dogs', 'horses', 'ducks', 'cows'],
    colors: ['#43A19E', '#7B43A1', '#F2317A', '#FF9824', '#58CF6C']
  };


  constructor (props) {
    super(props);

  };


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  static propTypes  =   {
    criteria        :   criteriaType,
    vote            :   voteType,
    item            :   itemType
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  toggleDescription (e) {
    console.info("toggleDescription", this, e);
    let d = React.findDOMNode(this.description);
    console.info("toggleDescription:", this.description, d.classList.toggle('syn-hide'));
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  componentDidMount () {
    this.makeChart();
  }

  componentDidUpdate () {
    ;
  }

  makeChart () {

    let { criteria, vote, item } = this.props;

    console.info("makeChart:",this);

    if ( ! vote ) {
      vote = {
        values    : {
          '-1'    : 0,
          '0'     : 0,
          '1'     : 0
        },
        total: 0
      };
    }

    if ( this.state.total !== null && vote.total === this.state.total ) {
      return;
    }

    if ( !this.props.item || (this.state.itemId && (this.props.item._id !== this.state.itemId)) ) {
      return;
    }


    var data = [];
    var series = [];

    for ( let number in vote.values ) {
      var tmp=[]; // data is an array of arrays or a series of arrays. in this case only 1 entry per series
      tmp.push(vote.values[number]);
      series.push(number);
      data.push(tmp);
      console.info("MakeChart for data", tmp, data);
    }

    console.info("makeChart data", data);

    this.setState({ data : data,
                    series : series,
                    total: vote.total,
                    itemId: this.props.item._id
                   });

    console.info("makeChart end", this);


    {/*for now - hard code the graph

    var data = [],
      series = 5,//getRandomInt(2, 10),
      serieLength = 3;//getRandomInt(2, 10);

    for (var i = series; i--; ) {
      var tmp = [];

      for (var j = serieLength; j--; ) {
        tmp.push(Math.floor(Math.random() * (20 - 0) + 0)); // (max - min)+min
      }

      data.push(tmp);     
    }

    this.setState({ data: data });

      */}

  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  render () {
    let { criteria, vote } = this.props;

    return (
      <div className="syn-votes-criteria" id={ `criteria-vote-${criteria._id}`}>
        <Row>
          <Column span="40" style={ {margin: "auto"} } >
            <div className="syn-vote-criteria-wrapper" >
              <div className="syn-vote-criteria-inner" >
                <h4 onClick={ this.toggleDescription.bind(this) }>{ criteria.name }</h4>
                <div className="syn-votes-criteria-description syn-hide" ref={(ref) => this.description = ref}>
                  <h5>{ criteria.description }</h5>
                </div>
              </div>
            </div>
          </Column>
          <Column span="60">
            <Charts
              data={ this.state.data }
              labels={ this.state.series }
              colors={ this.state.colors }
              height={ 3em }
            />
          </Column>
        </Row>
      </div>
    );
  }
}

export default Vote;
