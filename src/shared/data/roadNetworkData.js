export const ROAD_NETWORK_GEOJSON_PATH = '/data/balikpapan-road-network.geojson'
export const TRANSIT_NETWORK_GEOJSON_PATH = '/data/bacitra-route-network.geojson'

export const emptyRoadNetwork = {
  type: 'FeatureCollection',
  name: 'Jaringan Jalan Balikpapan',
  source: ROAD_NETWORK_GEOJSON_PATH,
  features: []
}

export const emptyTransitNetwork = {
  type: 'FeatureCollection',
  name: 'Rute Bacitra Balikpapan',
  source: TRANSIT_NETWORK_GEOJSON_PATH,
  features: []
}
