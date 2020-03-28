import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import { collectionBounds } from '../utils/mapboxglHelper'
import sites from '../../assets/data/sites.json'

mapboxgl.accessToken =
  'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ'

const markerHeight = 50
const markerRadius = 10
const linearOffset = 25
const DEFAULT_MAP_BOUNDS = collectionBounds(sites)
const MAP_FIT_CONFIG = { padding: 120, maxZoom: 9 }
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
}

export default function Map({
  searchResults,
  focusedResult,
  deployments,
  prompt,
}) {
  const mapContainer = useRef()
  const map = useRef()
  const [mapFit, setMapFit] = useState(DEFAULT_MAP_BOUNDS)
  const resultMarkers = useRef([])
  const popup = useRef()
  const selectionMarkers = useRef([])

  // mount map
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    })

    map.current.addControl(new mapboxgl.NavigationControl())

    return () => map.current.remove()
  }, [])

  // refit map
  useEffect(() => {
    // TODO: Do I need better validation at each of these branches?
    switch (true) {
      case mapFit instanceof mapboxgl.LngLatBounds:
        map.current.fitBounds(mapFit, MAP_FIT_CONFIG)
        break
      default:
        map.current.fitBounds(DEFAULT_MAP_BOUNDS, MAP_FIT_CONFIG)
        break
    }
  }, [mapFit])

  // manage result markers
  useEffect(() => {
    resultMarkers.current = searchResults.map((base) => (
      new mapboxgl.Marker().setLngLat(base).addTo(map.current)
    ))

    if (searchResults.length) {
      setMapFit(collectionBounds(searchResults))
    } else if (!prompt.for && mapFit !== DEFAULT_MAP_BOUNDS) {
      setMapFit(DEFAULT_MAP_BOUNDS)
    }

    return () => {
      resultMarkers.current.forEach((marker) => marker.remove())
    }
  }, [searchResults])

  // manage popup for currently-highlighted result
  useEffect(() => {
    if (searchResults[focusedResult]) {
      const base = searchResults[focusedResult]

      popup.current = new mapboxgl.Popup({ offset: POPUP_OFFSETS })
        .setLngLat(base)
        .setHTML(`<h1>${base.name}</h1>`)
        .addTo(map.current)
    }

    return () => {
      if (popup.current) popup.current.remove()
    }
  }, [focusedResult])

  // manage selected-deployment markers
  useEffect(() => {
    selectionMarkers.current = deployments
      .filter(({ base }) => base.id)
      .map(({ base }) => (
        new mapboxgl.Marker({ color: '#ce2c69' })
          .setLngLat(base)
          .addTo(map.current)
      ))

    return () => {
      selectionMarkers.current.forEach((marker) => marker.remove())
    }
  }, [deployments])

  // manage date picker
  useEffect(() => {
    if (prompt.for === 'period') {
      const target = deployments[prompt.targetIndex]

      setMapFit(target.base)

      popup.current = new mapboxgl.Popup({ offset: POPUP_OFFSETS })
        .setLngLat(target.base)
        .setHTML('<h1>WHEN WERE YOU THERE???</h1>')
        .addTo(map.current)
    }

    return () => {
      if (popup.current) popup.current.remove()
    }
  }, [prompt])

  return <div className="item__bifold-right" ref={mapContainer} />
}

Map.propTypes = {
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.string,
      lng: PropTypes.string,
    }),
  ).isRequired,
  focusedResult: PropTypes.number,
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  prompt: PropTypes.shape({
    for: PropTypes.string,
    targetIndex: PropTypes.number,
  }).isRequired,
}
