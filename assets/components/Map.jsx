import React from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1Ijoicmx1ZSIsImEiOiJjazZwOHIwdXcwNzg1M2xuejVkbGNkaGEwIn0.S0KbmonSFTp9xI5J2ZGANQ'

export default function Map() {
  const mapContainer = React.useRef()
  const map = React.useRef()

  React.useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    })

    map.current.addControl(new mapboxgl.NavigationControl())
    map.current.fitBounds([[38.9269981, 11.1166666], [78.35, 43.061306]])

    return () => map.current.remove()
  }, [])

  return (
    <div
      className="item__bifold-right"
      ref={mapContainer}
    />
  )
}
