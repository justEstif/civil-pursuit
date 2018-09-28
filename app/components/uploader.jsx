'use strict';

import React            from 'react';
import ReactDOM         from 'react-dom';
import Upload           from '../lib/util/upload';
import Row              from './util/row';
import Column           from './util/column';
import Button           from './util/button';
import Icon             from './util/icon';
import Input            from './util/input';
import Image            from './util/image';
import Youtube          from './youtube';

class Uploader extends React.Component {

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  static propTypes = {
    handler : React.PropTypes.func,
    image : React.PropTypes.string,
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  componentDidMount () {
    let dropbox = this.refs.dropbox,
      input = ReactDOM.findDOMNode(this.refs.typeFile), //this is a ref to a react component
      bucket = this.refs.bucket,
      replace = this.refs.replace;


    this.upload = new Upload(dropbox, input, bucket, replace);
    this.upload.init();

    this.upload.on('uploaded', this.stream.bind(this));
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  stream (file) {
    let stream = ss.createStream();


    ss(window.socket)
      .emit('upload image', stream, { size: file.size, name: file.name });

    ss.createBlobReadStream(file).pipe(stream);

    stream.on('end', () => {

      if ( this.props.handler ) {
        this.props.handler(file);
      }

    });
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  chooseFile () {
    let input = ReactDOM.findDOMNode(this.refs.typeFile);
    input.click();
  }

  chooseAnotherFile (e) {
    e.preventDefault();

    let dropbox = this.refs.dropbox,
      bucket = this.refs.bucket,
      input = ReactDOM.findDOMNode(this.refs.typeFile),
      replace = this.refs.replace;

    dropbox.style.display = 'block';
    bucket.style.display = 'none';
    replace.style.display = 'none';

    this.upload
      .destroy()
      .init();

    this.upload.on('uploaded', this.stream.bind(this));

    input.click();
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  render() {
    let { image } = this.props;

    let content = (
      <section className="syn-uploader" ref="view">
        <section className="syn-uploader-dropbox" ref="dropbox">
          <section className="syn-uploader-modern">
            <h4>Drop image here</h4>
            <p>or</p>
          </section>

          <section className="syn-uploader-legacy">
              <Button onClick={ this.chooseFile.bind(this) }>Choose a file</Button>
              <Input type="file" name="image" ref="typeFile" />
          </section>
        </section>

        <section className="syn-uploader-uploaded" ref="bucket"></section>

        <section className="syn-uploader-replace" ref="replace" onClick= { this.chooseAnotherFile.bind(this) }>
          <Icon icon="upload" />
          <a href="">Choose another image</a>
        </section>
      </section>
    )

    if ( image ) {
      let media;

      if ( YouTube.isYouTube(image) ) {
        media = ( <Youtube src={ image } /> );
      }
      else if ( image ) {
        media = ( <Image src={ image } responsive /> );
      }

      content = (
        <section className="syn-uploader" ref="view">
          <section className="syn-uploader-dropbox" ref="dropbox" style={{ display : 'none' }}>
            <section className="syn-uploader-modern">
              <h4>Drop image here</h4>
              <p>or</p>
            </section>

            <section className="syn-uploader-legacy">
                <Button onClick={ this.chooseFile.bind(this) }>Choose a file</Button>
                <Input type="file" name="image" ref="typeFile" />
            </section>
          </section>

          <section className="syn-uploader-uploaded show" ref="bucket">
            { media }
          </section>

          <section className="syn-uploader-replace show" ref="replace" onClick= { this.chooseAnotherFile.bind(this) }>
            <Icon icon="upload" />
            <a href="">Choose another image</a>
          </section>
        </section>
      );
    }

    return content;
  }
}

export default Uploader;
