import mapboxgl from 'mapbox-gl';
import ReactDOM from 'react-dom';

const markerHeight = 50;
const markerRadius = 10;
const linearOffset = 25;
const POPUP_OFFSETS = {
  top: [0, 0],
  'top-left': [0, 0],
  'top-right': [0, 0],
  bottom: [0, -markerHeight],
  'bottom-left': [
    linearOffset,
    (markerHeight - markerRadius + linearOffset) * -1,
  ],
  'bottom-right': [
    -linearOffset,
    (markerHeight - markerRadius + linearOffset) * -1,
  ],
  left: [markerRadius, (markerHeight - markerRadius) * -1],
  right: [-markerRadius, (markerHeight - markerRadius) * -1],
};

export function addMarker(map, site, element) {
  const placeholder = document.createElement('div');

  ReactDOM.render(element, placeholder);

  return new mapboxgl.Marker(placeholder).setLngLat(site).addTo(map);
}

export function addPopup(map, site, element, options) {
  const placeholder = document.createElement('div');

  ReactDOM.render(element, placeholder);

  return new mapboxgl.Popup({
    offset: POPUP_OFFSETS,
    closeButton: false,
    ...options,
  })
    .setDOMContent(placeholder)
    .setLngLat(site)
    .addTo(map);
}

// accepts an array of LngLatLikes and returns a LngLatBounds
export function collectionBounds(sites) {
  const lngs = sites.map(({ lng }) => lng);
  const lats = sites.map(({ lat }) => lat);
  const swBound = [Math.min(...lngs), Math.min(...lats)];
  const neBound = [Math.max(...lngs), Math.max(...lats)];

  return new mapboxgl.LngLatBounds([swBound, neBound]);
}
