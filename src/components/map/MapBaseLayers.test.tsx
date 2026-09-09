import { useEffect } from 'react';
import { TileLayer as LeafletTileLayer, type Map as LeafletMap } from 'leaflet';
import { MapContainer, useMap } from 'react-leaflet';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import MapBaseLayers from './MapBaseLayers';
import { SATELLITE_ATTRIBUTION, TILE_ATTRIBUTION } from './constants';

it('switches base layers and attribution while preserving the map view', async () => {
  const user = userEvent.setup();
  let map: LeafletMap | undefined;
  const CaptureMap = () => {
    const instance = useMap();
    useEffect(() => {
      map = instance;
    }, [instance]);
    return null;
  };
  const activeTiles = () => {
    const layers: LeafletTileLayer[] = [];
    map?.eachLayer((layer) => {
      if (layer instanceof LeafletTileLayer) layers.push(layer);
    });
    return layers;
  };

  const { container, rerender } = render(
    <MapContainer center={[34.7, 33]} zoom={8}>
      <MapBaseLayers />
      <CaptureMap />
    </MapContainer>,
  );
  await waitFor(() => expect(map).toBeDefined());
  expect(screen.getByRole('radio', { name: 'Streets' })).toBeChecked();
  expect(activeTiles()).toHaveLength(1);
  expect(activeTiles()[0]?.options.attribution).toBe(TILE_ATTRIBUTION);
  const center = map!.getCenter();
  const zoom = map!.getZoom();

  await user.click(screen.getByRole('radio', { name: 'Satellite' }));
  expect(activeTiles()).toHaveLength(1);
  expect(activeTiles()[0]?.options.attribution).toBe(SATELLITE_ATTRIBUTION);
  expect(container.querySelector('.leaflet-control-attribution')).toHaveTextContent('Esri');
  expect(container.querySelector('.leaflet-control-attribution')).not.toHaveTextContent(
    'OpenStreetMap',
  );

  rerender(
    <MapContainer center={[34.7, 33]} zoom={8}>
      <MapBaseLayers />
      <CaptureMap />
    </MapContainer>,
  );
  expect(screen.getByRole('radio', { name: 'Satellite' })).toBeChecked();
  expect(activeTiles()).toHaveLength(1);
  expect(map!.getCenter()).toEqual(center);
  expect(map!.getZoom()).toBe(zoom);

  await user.click(screen.getByRole('radio', { name: 'Streets' }));
  expect(activeTiles()).toHaveLength(1);
  expect(activeTiles()[0]?.options.attribution).toBe(TILE_ATTRIBUTION);
  expect(container.querySelector('.leaflet-control-attribution')).not.toHaveTextContent('Esri');
});
