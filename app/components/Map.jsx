import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import { addPopup, collectionBounds } from '../utils/mapboxglHelper'
import sites from '../../assets/data/sites.json'
import DatePickerPopup from './DatePickerPopup'
import ResultPopup from './ResultPopup'

mapboxgl.accessToken =
  'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ'

const DEFAULT_MAP_BOUNDS = collectionBounds(sites)
const MAP_FIT_CONFIG = { padding: 120, maxZoom: 9 }

export default function Map({
  focusedResult,
  deployments,
  dispatchDeployments,
  prompt,
  setPrompt,
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
    switch (true) {
      case mapFit instanceof mapboxgl.LngLat:
        map.current.flyTo({ center: mapFit, padding: 120, zoom: 9 }) // TODO: unify with MAP_FIT_CONFIG?
        break
      case mapFit instanceof mapboxgl.LngLatBounds:
        map.current.fitBounds(mapFit, MAP_FIT_CONFIG)
        break
      default:
        map.current.fitBounds(DEFAULT_MAP_BOUNDS, MAP_FIT_CONFIG)
        break
    }
  }, [mapFit])

  // manage popup for currently-highlighted result
  useEffect(() => {
    if (prompt.results && prompt.results[focusedResult]) {
      const base = prompt.results[focusedResult]

      popup.current = addPopup(map.current, base, <ResultPopup {...{ base }} />)
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

  // manage current UI task
  useEffect(() => {
    let deployment

    switch (prompt.for) {
      case 'search results':
        resultMarkers.current = prompt.results.map((base) => (
          new mapboxgl.Marker().setLngLat(base).addTo(map.current)
        ))

        if (prompt.results.length) setMapFit(collectionBounds(prompt.results))
        break
      case 'period':
        deployment = deployments.find((d) => d.id === prompt.id)

        setMapFit(new mapboxgl.LngLat(deployment.base.lng, deployment.base.lat))

        popup.current = addPopup(
          map.current,
          deployment.base,
          <DatePickerPopup
            {...{
              deployment,
              deployments,
              dispatchDeployments,
              setPrompt,
            }}
          />,
          { closeOnClick: false },
        )
        break
      default:
        setMapFit(DEFAULT_MAP_BOUNDS)
        break
    }

    return () => {
      resultMarkers.current.forEach((marker) => marker.remove())
      if (popup.current) popup.current.remove()
    }
  }, [prompt.for, prompt.id, prompt.results && prompt.results.map((r) => r.id).join('')])

  return <div className="item__bifold-right" ref={mapContainer} />
}

Map.propTypes = {
  focusedResult: PropTypes.number,
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  prompt: PropTypes.shape({
    for: PropTypes.string,
    id: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
      }),
    ),
  }).isRequired,
  setPrompt: PropTypes.func.isRequired,
}
