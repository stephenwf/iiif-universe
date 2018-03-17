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
        <div>
          { selected ? (
            <div>
              <button onClick={() => this.setState({ selected: false })}>back to all collections</button>
              <Collection url={selected['@id']} label={selected.label}/>
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
      </div>
    );
  }

}

export default Universe;