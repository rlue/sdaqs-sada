import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { addMarker, collectionBounds } from '../utils/mapboxglHelper';
import sites from '../../assets/data/sites.json';
import * as Icons from './Icons';

mapboxgl.accessToken = 'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ';

const DEFAULT_MAP_BOUNDS = collectionBounds(sites);
const MAP_FIT_CONFIG = { padding: 120, maxZoom: 9 };

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
    switch (true) {
      case mapFit instanceof mapboxgl.LngLat:
        // TODO: unify with MAP_FIT_CONFIG?
        map.current.flyTo({ center: mapFit, padding: 120, zoom: 9 });
        break;
      case mapFit instanceof mapboxgl.LngLatBounds:
        map.current.fitBounds(mapFit, MAP_FIT_CONFIG);
        break;
      default:
        map.current.fitBounds(DEFAULT_MAP_BOUNDS, MAP_FIT_CONFIG);
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

    switch (uiFocus.on) {
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
        deployment = deployments.find((d) => d.id === uiFocus.id);
        setMapFit(new mapboxgl.LngLat(deployment.base.lng, deployment.base.lat));
        break;
      default:
        setMapFit(DEFAULT_MAP_BOUNDS);
        break;
    }

    return () => {
      switch (uiFocus.on) {
        case 'search results':
          Object.values(resultMarkers.current).forEach((marker) => marker.remove());
          break;
        default:
          break;
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
      resultMarkerDiv.classList.add('mapboxgl-marker--highlighted');
      resultMarkerDiv.children[0].classList.add('map-pin--highlighted');
    }

    return () => {
      if (uiFocus.on === 'search results' && uiFocus.result) {
        const resultMarkerDiv = resultMarkers.current[
          uiFocus.result.id
        ].getElement();
        resultMarkerDiv.classList.remove('mapboxgl-marker--highlighted');
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
      selectionMarkerDiv.classList.add('mapboxgl-marker--highlighted');
      selectionMarkerDiv.children[0].classList.add('map-pin--highlighted');
    }

    return () => {
      if (uiFocus.on === 'hovered deployment') {
        const selectionMarkerDiv = selectionMarkers.current[
          uiFocus.deploymentId
        ].getElement();
        selectionMarkerDiv.classList.remove('mapboxgl-marker--highlighted');
        selectionMarkerDiv.children[0].classList.remove('map-pin--highlighted');
      }
    };
  }, [uiFocus.on && uiFocus.deploymentId]);

  return <div className="item__bifold-right" ref={mapContainer} />;
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
