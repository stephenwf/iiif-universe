import React, { Component } from 'react';
import Collection from '../Collection/Collection';

class Universe extends Component {

  state = { isLoaded: false, data: null, selected: null };

  componentWillMount() {
    fetch('https://raw.githubusercontent.com/ryanfb/iiif-universe/gh-pages/iiif-universe.json')
      .then(r => r.json())
      .then(data => this.setState(() => ({ isLoaded: true, data })));
  }

  render() {
    const { isLoaded, data, selected } = this.state;
    if (isLoaded === false) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <ul>
          {data.collections.map(collection => (
            <li onClick={() => this.setState({ selected: collection })}>
              {collection.label}
            </li>
          ))}
        </ul>
        <div>
          { selected ? (
            <div>
              <h2>Selected:</h2>
              <Collection url={selected['@id']} label={selected.label}/>
            </div>
          ) : null }
        </div>
      </div>
    );
  }

}

export default Universe;