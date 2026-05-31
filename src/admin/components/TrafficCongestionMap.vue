<template>
  <div class="card h-[26rem] overflow-hidden">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-cyan-200/60 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">B-Connect View</p>
        <h3 class="mt-1 font-bold text-slate-950">ATCS Traffic Monitoring</h3>
        <p class="mt-1 text-xs font-semibold text-slate-500">Simulasi CCTV + jalur kemacetan</p>
      </div>

      <div class="absolute bottom-4 right-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <h3 class="mb-3 text-sm font-bold text-slate-950">Legenda</h3>
        <div class="space-y-2 text-sm text-slate-600">
          <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-2">
            <span :style="{ background: item.color }" class="h-3.5 w-3.5 rounded-full"></span>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { trafficLocations } from '../../shared/data/mobilityData'
import { emptyRoadNetwork } from '../../shared/data/roadNetworkData.js'

const props = defineProps({
  locations: {
    type: Array,
    default: () => trafficLocations
  },
  roadNetwork: {
    type: Object,
    default: () => emptyRoadNetwork
  }
})

const mapContainer = ref(null)
let map
let trafficMarkers = []
let activeLayers = []

const legendItems = [
  { label: 'Kemacetan Berat', color: '#ef4444' },
  { label: 'Kemacetan Sedang', color: '#f59e0b' },
  { label: 'Lancar', color: '#10b981' }
]

const mapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
}

const visibleLocations = () => props.locations?.length ? props.locations : trafficLocations
const roadFeatureById = () => new Map((props.roadNetwork?.features || []).map((feature) => [feature.id, feature]))
const routeSegment = (location) => {
  const roadFeature = roadFeatureById().get(location.roadFeatureId)
  return roadFeature?.geometry?.coordinates?.length ? roadFeature.geometry.coordinates : location.segment || []
}

const createMarkerElement = (location) => {
  const marker = document.createElement('button')
  marker.className = 'traffic-line-marker'
  marker.style.background = location.color
  marker.textContent = `${location.density}%`
  marker.type = 'button'
  marker.setAttribute('aria-label', `${location.name}, kepadatan ${location.density}%`)
  return marker
}

const clearTrafficLayers = () => {
  trafficMarkers.forEach((marker) => marker.remove())
  trafficMarkers = []

  activeLayers.forEach(({ layerIds, sourceId }) => {
    layerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  })

  activeLayers = []
}

const fitTrafficBounds = (locations) => {
  const bounds = new maplibregl.LngLatBounds()

  locations.forEach((location) => {
    const segment = routeSegment(location)

    if (segment.length) {
      segment.forEach((coordinate) => bounds.extend(coordinate))
    } else {
      bounds.extend(location.coordinates)
    }
  })

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 70, right: 110, bottom: 70, left: 110 },
      maxZoom: 14.6,
      duration: 700
    })
  }
}

const addTrafficLayer = (location) => {
  const segment = routeSegment(location)

  if (!segment.length) {
    return
  }

  const sourceId = `traffic-route-${location.id}`
  const shadowLayerId = `traffic-route-shadow-${location.id}`
  const casingLayerId = `traffic-route-casing-${location.id}`
  const layerId = `traffic-route-layer-${location.id}`

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        id: location.id,
        name: location.name,
        density: location.density,
        level: location.level
      },
      geometry: {
        type: 'LineString',
        coordinates: segment
      }
    }
  })

  map.addLayer({
    id: shadowLayerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#0f172a',
      'line-width': 16,
      'line-opacity': 0.16,
      'line-blur': 2
    }
  })

  map.addLayer({
    id: casingLayerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#ffffff',
      'line-width': 12,
      'line-opacity': 0.94
    }
  })

  map.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': location.color,
      'line-width': 6,
      'line-opacity': 0.96
    }
  })
  activeLayers.push({ layerIds: [layerId, casingLayerId, shadowLayerId], sourceId })

  const marker = new maplibregl.Marker({
    element: createMarkerElement(location),
    anchor: 'center'
  })
    .setLngLat(location.coordinates)
    .setPopup(
      new maplibregl.Popup({ offset: 18 }).setHTML(`
        <div class="smart-map-popup">
          <strong>${location.name}</strong>
          <p>${location.description}</p>
          <p>Kepadatan ${location.density}% - ${location.avgSpeed} km/h</p>
        </div>
      `)
    )
    .addTo(map)

  trafficMarkers.push(marker)
}

const addRoadNetworkLayer = () => {
  if (map.getSource('balikpapan-road-network')) {
    map.getSource('balikpapan-road-network').setData(props.roadNetwork)
    return
  }

  map.addSource('balikpapan-road-network', {
    type: 'geojson',
    data: props.roadNetwork
  })

  map.addLayer({
    id: 'balikpapan-road-network-line',
    type: 'line',
    source: 'balikpapan-road-network',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#64748b',
      'line-width': 2,
      'line-opacity': 0.35
    }
  })
}

const renderTrafficLayers = () => {
  if (!map || !map.loaded()) {
    return
  }

  const locations = visibleLocations()
  addRoadNetworkLayer()
  clearTrafficLayers()
  locations.forEach(addTrafficLayer)
  fitTrafficBounds(locations)
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.852, -1.249],
    zoom: 13.8,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', renderTrafficLayers)
})

watch(
  () => props.locations,
  () => renderTrafficLayers(),
  { deep: true }
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style>
.traffic-line-marker {
  align-items: center;
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  font-size: 11px;
  font-weight: 800;
  height: 38px;
  justify-content: center;
  width: 38px;
}
</style>
