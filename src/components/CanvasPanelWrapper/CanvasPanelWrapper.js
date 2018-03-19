import React, {Component} from 'react';
import {
  Manifest,
  CanvasProvider,
  CanvasNavigation,
  SingleTileSource,
  OpenSeadragonViewer,
} from '@canvas-panel/core';

class CanvasPanelWrapper extends Component {
  render() {
    return (
      <Manifest url={this.props.manifest}>
        <CanvasProvider>
          <CanvasNavigation/>
          <SingleTileSource>
            <OpenSeadragonViewer maxHeight={1000}/>
          </SingleTileSource>
        </CanvasProvider>
        <button onClick={this.props.onClose}>Close</button>
      </Manifest>
    );
  }
}

export default CanvasPanelWrapper;
