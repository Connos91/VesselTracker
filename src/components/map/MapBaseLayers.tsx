import { LayersControl, TileLayer } from 'react-leaflet';
import {
  SATELLITE_ATTRIBUTION,
  SATELLITE_TILE_URL,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_URL,
} from './constants';

const MapBaseLayers = () => (
  <LayersControl position="topright" collapsed={false}>
    <LayersControl.BaseLayer checked name="Streets">
      <TileLayer
        className="map-street-tiles"
        url={TILE_URL}
        attribution={TILE_ATTRIBUTION}
        maxZoom={TILE_MAX_ZOOM}
      />
    </LayersControl.BaseLayer>
    <LayersControl.BaseLayer name="Satellite">
      <TileLayer
        url={SATELLITE_TILE_URL}
        attribution={SATELLITE_ATTRIBUTION}
        maxZoom={TILE_MAX_ZOOM}
      />
    </LayersControl.BaseLayer>
  </LayersControl>
);

export default MapBaseLayers;
