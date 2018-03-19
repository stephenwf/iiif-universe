import React, { Component } from 'react';
import Collection from '../Collection/Collection';

class Universe extends Component {

  state = { isLoaded: false, data: null, selected: null, viewer: 'universal-viewer' };

  componentWillMount() {
    fetch('https://raw.githubusercontent.com/ryanfb/iiif-universe/gh-pages/iiif-universe.json')
      .then(r => r.json())
      .then(data => this.setState(() => ({ isLoaded: true, data })));
  }

  handleCheckbox = () => {
    this.setState({
      viewer: this.state.viewer === 'universal-viewer' ? 'canvas-panel' : 'universal-viewer',
    });
  };

  render() {
    const { isLoaded, data, selected } = this.state;
    if (isLoaded === false) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <div>
          { selected ? (
            <div>
              <button onClick={() => this.setState({ selected: false })}>back to all collections</button>
              <Collection url={selected['@id']} label={selected.label} viewer={this.state.viewer}/>
            </div>
          ) : (
            <div>
              <ul>
                {data.collections.map(collection => (
                  <li onClick={() => this.setState({ selected: collection })}>
                    {collection.label}
                  </li>
                ))}
              </ul>
            </div>
          ) }
        </div>
        <label>
          <input type="checkbox" defaultChecked={this.state.viewer === 'canvas-panel'} onChange={this.handleCheckbox} />
          Try canvas panel
        </label>
      </div>
    );
  }

}

export default Universe;
