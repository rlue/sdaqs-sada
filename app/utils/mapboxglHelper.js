// accepts an array of LngLatLikes and returns a LngLatBoundsLike
export function collectionBounds(sites) {
  const longitudes = sites.map(({ longitude }) => longitude)
  const latitudes = sites.map(({ latitude }) => latitude)
  const swBound = [Math.min(...longitudes), Math.min(...latitudes)]
  const neBound = [Math.max(...longitudes), Math.max(...latitudes)]

  return [swBound, neBound]
}
