import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken =
  'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ'

export default function Map({ searchSuggestions, selection }) {
  const mapContainer = useRef()
  const map = useRef()
  const markers = useRef([])
  const popup = useRef()

  useMap(map, mapContainer)
  useMarkers(map, searchSuggestions, markers)

  return <div className="item__bifold-right" ref={mapContainer} />
}

Map.propTypes = {
  searchSuggestions: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
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

function useMarkers(map, searchSuggestions, markers) {
  useEffect(() => {
    markers.current = searchSuggestions.map(({ longitude, latitude }) =>
      new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map.current),
    )

    if (searchSuggestions.length) {
      const longitudes = searchSuggestions.map(({ longitude }) => longitude)
      const latitudes = searchSuggestions.map(({ latitude }) => latitude)
      const swBound = [Math.min(...longitudes), Math.min(...latitudes)]
      const neBound = [Math.max(...longitudes), Math.max(...latitudes)]

      map.current.fitBounds([swBound, neBound], { padding: 120, maxZoom: 9 })
    }

    return () => {
      markers.current.forEach((marker) => marker.remove())
    }
  }, [searchSuggestions])
}