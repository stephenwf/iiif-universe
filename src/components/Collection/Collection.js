import React, { Component } from 'react';
import oboe from 'oboe';
import VirtualList from 'react-virtual-list';
import * as fiveo from 'fiveo-web';

const MyList = ({
                  virtual,
                  itemHeight,
                }) => (
  <ul style={virtual.style}>
    {virtual.items.map(item => (
      <li key={`item_${item[ '@id' ]}`} style={{ height: itemHeight }}>
        {item.label}
      </li>
    ))}
  </ul>
);


const MyVirtualList = VirtualList()(MyList);


class Collection extends Component {

  state = {
    collections: [],
    manifests: [],
    results: [],
    loading: false,
    isFocused: false,
    fiveoLoaded: false,
  };

  index = null;
  creatingIndex = null;

  componentWillMount() {
    this.creatingIndex = setInterval(this.rebuildIndex, 1000);
    this.loadManifest(this.props.url);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.url !== this.props.url) {
      this.loadManifest(newProps.url);
    }
  }

  addManifest = (manifest) => {
    // Add the manifest as soon as possible
    setTimeout(() => {
      this.setState((state) => ({
        manifests: [ ...state.manifests, manifest ],
      }));
    }, 1);

    // Set to not loading when no new items come in.
    if (this.manifestTimeout) {
      clearTimeout(this.manifestTimeout);
    }
    this.manifestTimeout = setTimeout(() => {
      this.setState(() => ({
        isLoading: false,
      }));
    }, 100);


  };

  rebuildIndex = () => {
    if (this.loading === true || this.index === null) {

      // if (!this.state.isFocused) {
        console.info('Creating index');
        this.index = fiveo.createBlockingMatcher(this.state.manifests.map(e => e.label));
        this.setState({ fiveoLoaded: true })
      // }
    }
  };

  loadManifest(url) {
    this.setState({
      collections: [],
      manifests: [],
      results: [],
      loading: true,
    });
    oboe(url)
      .node('collections.*', collection => {
        if (collection[ '@type' ] === 'sc:Collection') {
          setTimeout(() => {
            this.setState((state) => ({
              collections: [ ...state.collections, collection ],
            }));
          }, 1);
          return oboe.drop;
        }
        if (collection[ '@type' ] === 'sc:Manifest') {
          this.addManifest(collection);
          return oboe.drop;
        }
      })
      .node('manifests.*', manifest => {
        if (manifest[ '@type' ] === 'sc:Manifest') {
          this.addManifest(manifest);
          return oboe.drop;
        }
      });
  }

  performSearch = (text) => {
    if (!text) {
      return this.setState({ results: [] });
    }
    this.index.then(matcher => matcher.search(text, 10)).then(results => {
      this.setState({ results });
    });
  };

  render() {
    const { collections, manifests, results, isFocused, fiveoLoaded, isLoading } = this.state;
    return (
      <div>
        {this.props.label}
        <h3>Collections</h3>
        <MyVirtualList
          items={collections}
          itemHeight={40}
        />

        <h3>Manifests</h3>
        { fiveoLoaded ? (
        <input type="text"
               onFocus={() => this.setState({ isFocused: true })}
               onBlur={() => this.setState({ isFocused: false })}
               onKeyUp={e => this.performSearch(e.currentTarget.value)}/>
        ) : null }
        {
          isFocused && isLoading ? 'Warning we are still fetching manifests, search may be incomplete.' : null
        }
        <ul style={{ border: '1px solid gray' }}>
          {this.state.results.sort((a, b) => {
            return b.score - a.score;
          }).map(r => {
            return(
            <li>
              <b>{r.text}</b>, <code>{r.score}</code>
            </li>
          )})}
        </ul>
        <div>
        </div>
        <MyVirtualList
          items={manifests}
          itemHeight={40}
        />
      </div>
    );
  }
}

export default Collection;