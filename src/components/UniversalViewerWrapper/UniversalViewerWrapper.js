import React, {Component} from 'react';

class UniversalViewerWrapper extends Component {
  static baseUrl = 'https://universalviewer.io/examples/uv/uv.html';

  getCurrentUrl() {
    const parts = [];
    parts.push(UniversalViewerWrapper.baseUrl);
    parts.push('#?');
    if (this.props.manifest) {
      parts.push('manifest=');
      parts.push(this.props.manifest);
    }
    parts.push('&c=0&m=0&s=0&cv=0&config=examples-config.json&locales=en-GB:English (GB),cy-GB:Cymraeg&r=0');
    return parts.join('');
  }

  render() {
    return (
      <div style={{ maxWidth: 1000, maxHeight: '100%', minHeight: 700, marginTop: 30 }}>
        <button style={{ position: 'absolute', right: -100, top: 0 }} onClick={this.props.onClose}>Close</button>
        <iframe
          src={this.getCurrentUrl()}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          allowfullscreen
          frameborder="0"/>
      </div>
    );
  }
}

export default UniversalViewerWrapper;
