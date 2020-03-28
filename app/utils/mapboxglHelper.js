import mapboxgl from 'mapbox-gl'

// accepts an array of LngLatLikes and returns a LngLatBounds
export function collectionBounds(sites) {
  const lngs = sites.map(({ lng }) => lng)
  const lats = sites.map(({ lat }) => lat)
  const swBound = [Math.min(...lngs), Math.min(...lats)]
  const neBound = [Math.max(...lngs), Math.max(...lats)]

  return new mapboxgl.LngLatBounds([swBound, neBound])
}
