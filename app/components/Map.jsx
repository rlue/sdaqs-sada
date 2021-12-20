import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { addMarker, collectionBounds } from '../utils/mapboxglHelper';
import sites from '../../data/sites.json';
import * as Icons from './Icons';

mapboxgl.accessToken = MAPBOXGL_ACCESS_TOKEN;

const DEFAULT_MAP_BOUNDS = collectionBounds(Object.values(sites));

export default function Map({
  deployments,
  userFlow,
  setUserFlow,
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
      left: 120 + document.querySelector('.side-panel').offsetWidth + 32, // FIXME 32 is 2rem hmargin
      right: 120,
    };

    switch (true) {
      case mapFit instanceof mapboxgl.LngLat:
        map.current.fitBounds(collectionBounds([mapFit]), { padding, maxZoom: 9 });
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
            onClick={() => setUserFlow({
              mode: 'map',
              action: 'edit deployment',
              deploymentId: id,
            })}
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

    switch (userFlow.action) {
      case 'none': // used to reset this effect & invoke cleanup with no other changes
        break;
      case 'search bases':
        resultMarkers.current = userFlow.results.reduce((markers, base) => {
          if (!(base.id in markers)) {
            markers[base.id] = addMarker(
              map.current,
              base,
              <Icons.MapPin className="map-pin--search-result" />,
            );
          }

          return markers;
        }, {});

        if (userFlow.results.length) setMapFit(collectionBounds(userFlow.results));
        break;
      case 'edit deployment':
        selectionMarkers
          .current[userFlow.deploymentId]
          .getElement()
          .children[0]
          ?.classList
          .remove('cursor-pointer');

        deployment = deployments.find((d) => d.id === userFlow.deploymentId);
        setMapFit(new mapboxgl.LngLat(deployment.base.lng, deployment.base.lat));
        break;
      case 'review deployments':
        setMapFit(collectionBounds(
          deployments.filter(({ base }) => base.id).map(({ base }) => base),
        ));

        if (selectionMarkers.current[userFlow.deploymentId]) {
          selectionMarkers
            .current[userFlow.deploymentId]
            .getElement()
            .children[0]
            ?.classList
            .add('map-pin--highlighted');
        }
        break;
      default:
        setMapFit(DEFAULT_MAP_BOUNDS);
        break;
    }

    return () => {
      switch (userFlow.action) { // eslint-disable-line default-case
        case 'search bases':
          Object.values(resultMarkers.current).forEach((marker) => marker.remove());
          break;
        case 'edit deployment':
          selectionMarkers
            .current[userFlow.deploymentId]
            .getElement()
            .children[0]
            ?.classList.add('cursor-pointer');
          break;
        case 'review deployments':
          if (selectionMarkers.current[userFlow.deploymentId]) {
            selectionMarkers
              .current[userFlow.deploymentId]
              .getElement()
              .children[0]
              ?.classList
              .remove('map-pin--highlighted');
            break;
          }
      }
    };
  }, [
    userFlow.action,
    userFlow.deploymentId,
    userFlow.results && userFlow.results.map((r) => r.id).join(''),
  ]);

  // manage visual feedback for currently-highlighted result
  useEffect(() => {
    if (userFlow.action === 'search bases' && userFlow.result) {
      const resultMarkerDiv = resultMarkers.current[
        userFlow.result.id
      ].getElement();
      resultMarkerDiv.classList.add('z-10');
      resultMarkerDiv.children[0]?.classList.add('map-pin--highlighted');
    }

    return () => {
      if (userFlow.action === 'search bases' && userFlow.result) {
        const resultMarkerDiv = resultMarkers.current[
          userFlow.result.id
        ].getElement();
        resultMarkerDiv.classList.remove('z-10');
        resultMarkerDiv.children[0]?.classList.remove('map-pin--highlighted');
      }
    };
  }, [userFlow.action && userFlow.result && userFlow.result.id]);

  // manage visual feedback for currently-hovered deployment
  useEffect(() => {
    const selectionMarker = selectionMarkers.current[userFlow.deploymentId];

    if (userFlow.action === 'preview deployment' && selectionMarker) {
      const selectionMarkerDiv = selectionMarker.getElement();
      selectionMarkerDiv.classList.add('z-10');
      selectionMarkerDiv.children[0]?.classList.add('map-pin--highlighted');
    }

    return () => {
      if (userFlow.action === 'preview deployment' && selectionMarker) {
        const selectionMarkerDiv = selectionMarker.getElement();
        selectionMarkerDiv.classList.remove('z-10');
        selectionMarkerDiv.children[0]?.classList.remove('map-pin--highlighted');
      }
    };
  }, [userFlow.action && userFlow.deploymentId]);

  return <div className="h-screen w-screen" ref={mapContainer} />;
}

Map.propTypes = {
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  userFlow: PropTypes.shape({
    mode: PropTypes.string,
    action: PropTypes.string,
    deploymentId: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
      }),
    ),
    result: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      lat: PropTypes.string,
      lng: PropTypes.string,
    }),
  }).isRequired,
  setUserFlow: PropTypes.func.isRequired,
};
