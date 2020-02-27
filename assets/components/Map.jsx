import React from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken =
  'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ'

export default function Map({ matches }) {
  const mapContainer = React.useRef()
  const map = React.useRef()
  const markers = React.useRef([])

  React.useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    })

    map.current.addControl(new mapboxgl.NavigationControl())
    map.current.fitBounds([
      [38.9269981, 11.1166666],
      [78.35, 43.061306],
    ])

    return () => map.current.remove()
  }, [])

  React.useEffect(() => {
    markers.current = matches.map(({ longitude, latitude }) =>
      new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map.current),
    )

    return () => {
      markers.current.forEach((marker) => marker.remove())
    }
  }, [matches])

  return <div className="item__bifold-right" ref={mapContainer} />
}

Map.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
}
