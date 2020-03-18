import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken =
  'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ'

export default function Map({
  searchResults,
  focusedResult,
  deployments,
}) {
  const mapContainer = useRef()
  const map = useRef()
  const resultMarkers = useRef([])
  const popup = useRef()
  const selectionMarkers = useRef([])

  useMap(map, mapContainer)
  useResultMarkers(map, searchResults, resultMarkers)
  usePopup(map, searchResults, focusedResult, popup)
  useSelectionMarkers(map, deployments, selectionMarkers)

  return <div className="item__bifold-right" ref={mapContainer} />
}

Map.propTypes = {
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  focusedResult: PropTypes.number,
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
}

function useMap(map, mapContainer) {
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    })

    map.current.addControl(new mapboxgl.NavigationControl())
    map.current.fitBounds([
      [38.9269981, 11.1166666],
      [78.35, 43.061306],
      { padding: 120 },
    ])

    return () => map.current.remove()
  }, [])
}

function useResultMarkers(map, searchResults, resultMarkers) {
  useEffect(() => {
    resultMarkers.current = searchResults.map(
      ({ longitude, latitude }) =>
        new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(map.current),
    )

    if (searchResults.length) {
      const longitudes = searchResults.map(({ longitude }) => longitude)
      const latitudes = searchResults.map(({ latitude }) => latitude)
      const swBound = [Math.min(...longitudes), Math.min(...latitudes)]
      const neBound = [Math.max(...longitudes), Math.max(...latitudes)]

      map.current.fitBounds([swBound, neBound], { padding: 120, maxZoom: 9 })
    } else {
      map.current.fitBounds([
        [38.9269981, 11.1166666],
        [78.35, 43.061306],
        { padding: 120 },
      ])
    }

    return () => {
      resultMarkers.current.forEach((marker) => marker.remove())
    }
  }, [searchResults])
}

function usePopup(map, searchResults, focusedResult, popup) {
  useEffect(() => {
    if (searchResults[focusedResult]) {
      const match = searchResults[focusedResult]

      const markerHeight = 50,
        markerRadius = 10,
        linearOffset = 25
      const popupOffsets = {
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
      }
      popup.current = new mapboxgl.Popup({ offset: popupOffsets })
        .setLngLat([match.longitude, match.latitude])
        .setHTML(`<h1>${match.name}</h1>`)
        .addTo(map.current)
    }

    return () => {
      popup.current && popup.current.remove()
    }
  }, [searchResults, focusedResult])
}

function useSelectionMarkers(map, deployments, selectionMarkers) {
  useEffect(() => {
    selectionMarkers.current = deployments
      .filter(({ base }) => base.id)
      .map(({ base }) =>
        new mapboxgl.Marker({ color: '#ce2c69' })
          .setLngLat([base.longitude, base.latitude])
          .addTo(map.current),
      )

    /*
    if (deployments.filter(({ base }) => base).length) {
      const longitudes = deployments.filter(({ base }) => base).map(({ base }) => base.longitude)
      const latitudes = deployments.filter(({ base }) => base).map(({ base }) => base.latitude)
      const swBound = [Math.min(...longitudes), Math.min(...latitudes)]
      const neBound = [Math.max(...longitudes), Math.max(...latitudes)]

      map.current.fitBounds([swBound, neBound], { padding: 120, maxZoom: 9 })
    }
    */

    return () => {
      selectionMarkers.current.forEach((marker) => marker.remove())
    }
  }, [deployments])
}
