import React from 'react';

class VerticalScrollbar extends React.Component {

  constructor() {
    super();
    this.state = {
      height: 0,
      dragging: false,
      start: 0,
    };

    this.jump = this.jump.bind(this);
    this.startDrag = this.startDrag.bind(this);
  }

  componentDidMount() {
    this.calculateSize(this.props);

    // Put the Listener
    document.addEventListener('mousemove', this.onDrag.bind(this));
    document.addEventListener('touchmove', this.onDrag.bind(this));
    document.addEventListener('mouseup', this.stopDrag.bind(this));
    document.addEventListener('touchend', this.stopDrag.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.wrapper.height !== this.props.wrapper.height ||
        nextProps.area.height !== this.props.area.height) this.calculateSize(nextProps);
  }

  componentWillUnmount() {
    // Remove the Listener
    document.removeEventListener('mousemove', this.onDrag.bind(this));
    document.removeEventListener('touchmove', this.onDrag.bind(this));
    document.removeEventListener('mouseup', this.stopDrag.bind(this));
    document.removeEventListener('touchend', this.stopDrag.bind(this));
  }

  onDrag(event) {
    if (this.state.dragging) {
      // Make The Parent being in the Dragging State
      this.props.onDragging();

      event.preventDefault();
      event.stopPropagation();

      const e = event.changedTouches ? event.changedTouches[0] : event;

      const yMovement = e.clientY - this.state.start;
      const yMovementPercentage = (yMovement / this.props.wrapper.height) * 100;

      // Update the last e.clientY
      this.setState({ start: e.clientY }, () => {
        // The next Vertical Value will be
        const next = this.props.scrolling + yMovementPercentage;

        // Tell the parent to change the position
        this.props.onChangePosition(next, 'vertical');
      });
    }
  }

  startDrag(event) {
    event.preventDefault();
    event.stopPropagation();

    const e = event.changedTouches ? event.changedTouches[0] : event;

    // Prepare to drag
    this.setState({
      dragging: true,
      start: e.clientY,
    });
  }

  stopDrag() {
    if (this.state.dragging) {
      // Parent Should Change the Dragging State
      this.props.onStopDrag();
      this.setState({ dragging: false });
    }
  }

  jump(e) {
    const isContainer = e.target === this.container;

    if (isContainer) {
      // Get the Element Position
      const position = this.scrollbar.getBoundingClientRect();

      // Calculate the vertical Movement
      const yMovement = e.clientY - position.top;
      const centerize = (this.state.height / 2);
      const yMovementPercentage = ((yMovement / this.props.wrapper.height) * 100) - centerize;

      // Update the last e.clientY
      this.setState({ start: e.clientY }, () => {
        // The next Vertical Value will be
        const next = this.props.scrolling + yMovementPercentage;

        // Tell the parent to change the position
        this.props.onChangePosition(next, 'vertical');
      });
    }
  }

  calculateSize(source) {
    // Scrollbar Width
    this.setState({ height: (source.wrapper.height / source.area.height) * 100 });
  }

  render() {
    const className = (base, name, pos, act, isAct) =>
      [
        base + name,
        base + name + pos,
        isAct ? base + name + act : '',
        isAct ? base + name + pos + act : '',
      ].join(' ');

    if (this.state.height < 100) {
      return (
        <div
          className={
            className(
              '-reactjs-scrollbar',
              '-track', ':vertical',
              ':dragging',
              this.state.dragging || this.props.draggingFromParent,
          )}
          ref={(c) => { this.container = c; }}
          onClick={this.jump}
          style={this.props.style}
        >

          <div
            className={
              className(
                '-reactjs-scrollbar',
                '-thumb', ':vertical',
                ':dragging',
                this.state.dragging || this.props.draggingFromParent,
              )}
            ref={(c) => { this.scrollbar = c; }}
            onTouchStart={this.startDrag}
            onMouseDown={this.startDrag}
            style={{
              position: 'relative',
              height: `${this.state.height}%`,
              top: `${this.props.scrolling}%`,
            }}
          />

        </div>
      );
    }
    return null;
  }

}


// The Props
VerticalScrollbar.propTypes = {
  draggingFromParent: React.PropTypes.bool.isRequired,
  scrolling: React.PropTypes.number.isRequired,
  wrapper: React.PropTypes.shape().isRequired,
  area: React.PropTypes.shape().isRequired,
  onChangePosition: React.PropTypes.func.isRequired,
  onDragging: React.PropTypes.func.isRequired,
  onStopDrag: React.PropTypes.func.isRequired,
};

export default VerticalScrollbar;