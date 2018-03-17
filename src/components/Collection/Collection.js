import React, { Component } from 'react';
import oboe from 'oboe';
import VirtualList from 'react-virtual-list';
import * as fiveo from 'fiveo-web';
import {
  Manifest,
  CanvasProvider,
  CanvasNavigation,
  LocaleString,
  SingleTileSource,
  OpenSeadragonViewer,
} from '@canvas-panel/core';

const MyList = ({
                  virtual,
                  itemHeight,
                  onClick,
                }) => (
  <ul style={virtual.style}>
    {virtual.items.map(item => (
      <li key={`item_${item[ '@id' ]}`} onClick={onClick(item)} style={{ height: itemHeight }}>
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
    selectedManifest: null,
    selectedCollection: null,
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
      this.setState({ fiveoLoaded: true });
      // }
    }
  };

  loadManifest(url) {
    this.setState({
      collections: [],
      manifests: [],
      results: [],
      loading: true,
      hasError: false,
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

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true, error, selectedManifest: null });
    setTimeout(() => {
      this.setState({ hasError: false })
    }, 5000)
  }


  handleClick = (item) => () => {
    if (item[ '@type' ] === 'sc:Manifest') {
      this.setState({ selectedManifest: item[ '@id' ] });
    }
  };

  performSearch = (text) => {
    if (!text) {
      return this.setState({ results: [] });
    }
    this.index.then(matcher => matcher.search(text, 10)).then(results => {
      this.setState({ results });
    });
  };

  handleCollectionClick = (collection) => () => {
    this.setState({ selectedCollection: collection });
  };

  render() {
    const { collections, hasError, manifests, results, isFocused, selectedManifest, fiveoLoaded, isLoading, selectedCollection } = this.state;

    return (
      <div>
        { hasError ? (
          <div style={{ background: 'red', color: '#fff', padding: 15, position: 'fixed', top: 0, left: 0, right: 0, width: '100%' }}>Something went wrong viewing that manifest</div>
        ) : null }
        {selectedCollection ? (
          <div>
            <button onClick={() => this.setState({ selectedCollection: null })}>back</button>
            <h2>Collection: { selectedCollection.label }</h2>
            <Collection url={selectedCollection['@id']}/>
          </div>
        ) : (
          <div>
            {this.props.label}
            <h3>Collections</h3>
            <MyVirtualList
              items={collections}
              itemHeight={40}
              onClick={this.handleCollectionClick}
            />
            <h3>Manifests</h3>
            {selectedManifest ? (
              <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' }}>
                <div style={{ maxWidth: 1000, margin: 'auto', zIndex: 2, position: 'relative', background: '#fff' }}>
                  <Manifest url={selectedManifest}>
                    <CanvasProvider startCanvas={3}>
                      <CanvasNavigation/>
                      <SingleTileSource>
                        <OpenSeadragonViewer maxHeight={1000}/>
                      </SingleTileSource>
                    </CanvasProvider>
                    <button onClick={() => this.setState({ selectedManifest: null })}>Close</button>
                  </Manifest>
                </div>
                <div
                  onClick={() => this.setState({ selectedManifest: null })}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,.3)',
                    zIndex: 1,
                  }}/>
              </div>
            ) : null}
            {fiveoLoaded ? (
              <input type="text"
                     onFocus={() => this.setState({ isFocused: true })}
                     onBlur={() => this.setState({ isFocused: false })}
                     onKeyUp={e => this.performSearch(e.currentTarget.value)}/>
            ) : null}
            {
              isFocused && isLoading ? 'Warning we are still fetching manifests, search may be incomplete.' : null
            }
            <ul style={{ border: '1px solid gray' }}>
              {this.state.results.sort((a, b) => {
                return b.score - a.score;
              }).map(r => {
                return (
                  <li>
                    <b>{r.text}</b>, <code>{r.score}</code>
                  </li>
                );
              })}
            </ul>
            <div>
            </div>
            <MyVirtualList
              items={manifests}
              onClick={this.handleClick}
              itemHeight={40}
            />
          </div>
        )}
      </div>
    );
  }
}

export default Collection;