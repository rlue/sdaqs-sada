import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { addMarker, collectionBounds } from '../utils/mapboxglHelper';
import sites from '../../assets/data/sites.json';
import * as Icons from './Icons';

mapboxgl.accessToken = 'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ';

const DEFAULT_MAP_BOUNDS = collectionBounds(sites);

export default function Map({
  deployments,
  uiFocus,
  setUIFocus,
}) {
  const mapContainer = useRef();
  const map = useRef();
  const [mapFit, setMapFit] = useState(DEFAULT_MAP_BOUNDS);
  const resultMarkers = useRef({});
  const selectionMarkers = useRef({});

  // mount map
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => map.current.remove();
  }, []);

  // refit map
  useEffect(() => {
    const padding = {
      top: 120,
      bottom: 120,
      left: 120 + document.querySelector('#search-panel').offsetWidth + 32, // FIXME 32 is 2rem hmargin
      right: 120,
    };

    switch (true) {
      case mapFit instanceof mapboxgl.LngLat:
        map.current.flyTo({ center: mapFit, padding, zoom: 9 });
        break;
      case mapFit instanceof mapboxgl.LngLatBounds:
        map.current.fitBounds(mapFit, { padding, maxZoom: 9 });
        break;
      default:
        map.current.fitBounds(DEFAULT_MAP_BOUNDS, { padding, maxZoom: 9 });
        break;
    }
  }, [mapFit]);

  // manage selected-deployment markers
  useEffect(() => {
    selectionMarkers.current = deployments
      .slice(0) //  iterate backwards so that
      .reverse() // lower-numbered markers appear on top
      .filter(({ base }) => base.id)
      .reduce((markers, { id, base }, i) => {
        markers[id] = addMarker(
          map.current,
          base,
          <Icons.MapPin
            className="map-pin--selection"
            onClick={() => setUIFocus({ on: 'deployment details', id })}
            index={deployments.length - (i + 1)}
            label={base}
          />,
        );

        return markers;
      }, {});

    return () => {
      Object.values(selectionMarkers.current).forEach((marker) => marker.remove());
    };
  }, [deployments]);

  // manage current UI focus
  useEffect(() => {
    let deployment;
    let markerNode;

    switch (uiFocus.on) {
      case 'nothing': // used to reset this effect & invoke cleanup with no other changes
        break;
      case 'search results':
        resultMarkers.current = uiFocus.results.reduce((markers, base) => {
          if (!(base.id in markers)) {
            markers[base.id] = addMarker(
              map.current,
              base,
              <Icons.MapPin className="map-pin--search-result" />,
            );
          }

          return markers;
        }, {});

        if (uiFocus.results.length) setMapFit(collectionBounds(uiFocus.results));
        break;
      case 'deployment details':
        markerNode = selectionMarkers.current[uiFocus.id].getElement();

        if (markerNode.children.length) {
          markerNode.children[0].classList.remove('cursor-pointer');
        }

        deployment = deployments.find((d) => d.id === uiFocus.id);
        setMapFit(new mapboxgl.LngLat(deployment.base.lng, deployment.base.lat));
        break;
      case 'selected bases':
        setMapFit(collectionBounds(
          deployments.filter(({ base }) => base.id).map(({ base }) => base),
        ));

        if (selectionMarkers.current[uiFocus.id]) {
          selectionMarkers
            .current[uiFocus.id]
            .getElement()
            .children[0]
            .classList
            .add('map-pin--highlighted');
        }
        break;
      default:
        setMapFit(DEFAULT_MAP_BOUNDS);
        break;
    }

    return () => {
      switch (uiFocus.on) { // eslint-disable-line default-case
        case 'search results':
          Object.values(resultMarkers.current).forEach((marker) => marker.remove());
          break;
        case 'deployment details':
          if (!selectionMarkers.current[uiFocus.id]) break;

          markerNode = selectionMarkers.current[uiFocus.id].getElement();

          if (markerNode.children.length) {
            markerNode.children[0].classList.add('cursor-pointer');
          }
          break;
        case 'selected bases':
          if (selectionMarkers.current[uiFocus.id]) {
            selectionMarkers
              .current[uiFocus.id]
              .getElement()
              .children[0]
              .classList
              .remove('map-pin--highlighted');
            break;
          }
      }
    };
  }, [
    uiFocus.on,
    uiFocus.id,
    uiFocus.results && uiFocus.results.map((r) => r.id).join(''),
  ]);

  // manage visual feedback for currently-highlighted result
  useEffect(() => {
    if (uiFocus.on === 'search results' && uiFocus.result) {
      const resultMarkerDiv = resultMarkers.current[
        uiFocus.result.id
      ].getElement();
      resultMarkerDiv.classList.add('z-10');
      resultMarkerDiv.children[0].classList.add('map-pin--highlighted');
    }

    return () => {
      if (uiFocus.on === 'search results' && uiFocus.result) {
        const resultMarkerDiv = resultMarkers.current[
          uiFocus.result.id
        ].getElement();
        resultMarkerDiv.classList.remove('z-10');
        resultMarkerDiv.children[0].classList.remove('map-pin--highlighted');
      }
    };
  }, [uiFocus.on && uiFocus.result && uiFocus.result.id]);

  // manage visual feedback for currently-hovered deployment
  useEffect(() => {
    if (uiFocus.on === 'hovered deployment') {
      const selectionMarkerDiv = selectionMarkers.current[
        uiFocus.deploymentId
      ].getElement();
      selectionMarkerDiv.classList.add('z-10');
      selectionMarkerDiv.children[0].classList.add('map-pin--highlighted');
    }

    return () => {
      if (uiFocus.on === 'hovered deployment') {
        const selectionMarkerDiv = selectionMarkers.current[
          uiFocus.deploymentId
        ].getElement();
        selectionMarkerDiv.classList.remove('z-10');
        selectionMarkerDiv.children[0].classList.remove('map-pin--highlighted');
      }
    };
  }, [uiFocus.on && uiFocus.deploymentId]);

  return <div className="h-full w-full" ref={mapContainer} />;
}

Map.propTypes = {
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  uiFocus: PropTypes.shape({
    on: PropTypes.string,
    id: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
      }),
    ),
    result: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      lat: PropTypes.string,
      lng: PropTypes.string,
    }),
    deploymentId: PropTypes.string,
  }).isRequired,
  setUIFocus: PropTypes.func.isRequired,
};
