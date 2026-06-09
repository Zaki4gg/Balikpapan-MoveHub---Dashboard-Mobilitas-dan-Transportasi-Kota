<template>
  <div class="card h-[28rem] overflow-hidden">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Transit Map</p>
        <h3 class="mt-1 font-bold text-slate-950">Rute dan Posisi Bacitra</h3>
        <p class="mt-1 text-xs font-semibold text-slate-500">OSRM/OSM GeoJSON lokal</p>
      </div>

      <div class="absolute bottom-4 right-4 z-10 max-w-56 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <h3 class="mb-3 text-sm font-bold text-slate-950">Rute Aktif</h3>
        <div class="space-y-2 text-sm text-slate-600">
          <div v-for="route in routes" :key="route.id" class="flex items-center gap-2">
            <span :style="{ background: route.color }" class="h-3.5 w-3.5 rounded-full"></span>
            <span>{{ route.shortName }}</span>
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
import { activeBuses, transitRoutes } from '../../shared/data/mobilityData'
import { emptyTransitNetwork } from '../../shared/data/roadNetworkData.js'

const props = defineProps({
  routes: {
    type: Array,
    default: () => transitRoutes
  },
  buses: {
    type: Array,
    default: () => activeBuses
  },
  transitNetwork: {
    type: Object,
    default: () => emptyTransitNetwork
  }
})

const mapContainer = ref(null)
let map
let busMarkers = []
let routeLayers = []
let busAnimations = new Set()

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

const routeFeatureByRouteId = () => new Map(
  (props.transitNetwork?.features || []).map((feature) => [feature.properties?.routeId, feature])
)

const routeGeometry = (route) => {
  if (route.path?.length) {
    return route.path
  }

  const feature = routeFeatureByRouteId().get(route.id)
  return feature?.geometry?.coordinates?.length ? feature.geometry.coordinates : route.path || []
}

const nearestRouteCoordinate = (bus) => {
  const route = props.routes.find((item) => item.id === bus.routeId)
  const path = route ? routeGeometry(route) : []

  if (!path.length) {
    return bus.coordinates
  }

  return path.reduce((nearest, coordinate) => {
    const distance = Math.hypot(coordinate[0] - bus.coordinates[0], coordinate[1] - bus.coordinates[1])
    return distance < nearest.distance ? { coordinate, distance } : nearest
  }, { coordinate: path[0], distance: Infinity }).coordinate
}

const createBusMarker = (bus, route) => {
  const marker = document.createElement('button')
  marker.className = bus.status.startsWith('Delayed') ? 'transit-bus-marker transit-bus-marker--delayed' : 'transit-bus-marker'
  marker.style.setProperty('--bus-color', route?.color || '#0ea5e9')
  marker.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="14" height="13" rx="3"></rect>
      <path d="M8 8h8M8 12h8M8 20l1.5-3M16 20l-1.5-3"></path>
    </svg>
  `
  marker.type = 'button'
  marker.setAttribute('aria-label', `${bus.number}, ${bus.route}, ${bus.status}`)
  return marker
}

const clearMapLayers = () => {
  busAnimations.forEach((animationId) => cancelAnimationFrame(animationId))
  busAnimations = new Set()

  busMarkers.forEach((marker) => marker.remove())
  busMarkers = []

  routeLayers.forEach(({ layerIds, sourceId }) => {
    layerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  })
  routeLayers = []
}

const fitBounds = () => {
  const bounds = new maplibregl.LngLatBounds()

  props.routes.forEach((route) => {
    routeGeometry(route).forEach((coordinate) => bounds.extend(coordinate))
  })

  props.buses.forEach((bus) => bounds.extend(nearestRouteCoordinate(bus)))

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 70, right: 110, bottom: 70, left: 110 },
      maxZoom: 14.5,
      duration: 700
    })
    updateMarkerScale()
  }
}

const lineWidthByZoom = (baseWidth, minRatio = 0.42, maxBonus = 1) => [
  'interpolate',
  ['linear'],
  ['zoom'],
  9,
  Math.max(1, baseWidth * minRatio),
  11.5,
  Math.max(1.5, baseWidth * 0.62),
  13.5,
  baseWidth,
  16,
  baseWidth + maxBonus
]

const addRouteLayer = (route) => {
  const path = routeGeometry(route)

  if (!path.length) {
    return
  }

  const sourceId = `transit-route-${route.id}`
  const casingLayerId = `transit-route-casing-${route.id}`
  const layerId = `transit-route-layer-${route.id}`

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        name: route.name,
        status: route.status
      },
      geometry: {
        type: 'LineString',
        coordinates: path
      }
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
      'line-width': lineWidthByZoom(11, 0.38, 1.5),
      'line-opacity': 0.9
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
      'line-color': route.color,
      'line-width': lineWidthByZoom(5),
      'line-opacity': route.status === 'active' ? 0.88 : 0.62
    }
  })

  routeLayers.push({ layerIds: [layerId, casingLayerId], sourceId })
}

const mapMarkerScale = () => {
  if (!map) {
    return 1
  }

  const zoom = map.getZoom()
  if (zoom <= 10) return 0.58
  if (zoom <= 11.5) return 0.68
  if (zoom <= 13) return 0.82
  return 1
}

const updateMarkerScale = () => {
  const scale = mapMarkerScale()
  busMarkers.forEach((marker) => {
    marker.getElement().style.setProperty('--map-marker-scale', scale)
  })
}

const interpolateCoordinate = (from, to, progress) => [
  from[0] + ((to[0] - from[0]) * progress),
  from[1] + ((to[1] - from[1]) * progress)
]

const stableSeed = (value) =>
  String(value ?? '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)

const pathMetrics = (path) => {
  const segmentLengths = []
  let totalLength = 0

  for (let index = 0; index < path.length - 1; index += 1) {
    const distance = Math.hypot(path[index + 1][0] - path[index][0], path[index + 1][1] - path[index][1])
    segmentLengths.push(distance)
    totalLength += distance
  }

  return { segmentLengths, totalLength }
}

const coordinateAtDistance = (path, metrics, rawDistance) => {
  if (path.length < 2) {
    return path[0]
  }

  if (!metrics.totalLength) {
    return path[0]
  }

  let distance = ((rawDistance % metrics.totalLength) + metrics.totalLength) % metrics.totalLength

  for (let index = 0; index < metrics.segmentLengths.length; index += 1) {
    const segmentLength = metrics.segmentLengths[index]

    if (distance <= segmentLength || index === metrics.segmentLengths.length - 1) {
      const progress = segmentLength ? distance / segmentLength : 0
      return interpolateCoordinate(path[index], path[index + 1], progress)
    }

    distance -= segmentLength
  }

  return path[path.length - 1]
}

const distributedBusDistance = (path, bus, routeBusIndex = 0, routeBusCount = 1) => {
  const metrics = pathMetrics(path)

  if (!metrics.totalLength) {
    return { metrics, distance: 0, coordinate: path[0] || bus.coordinates }
  }

  const spacing = 1 / Math.max(routeBusCount, 1)
  const seed = stableSeed(bus.id || bus.number)
  const jitter = ((seed % 9) - 4) * Math.min(0.018, spacing * 0.18)
  const progress = ((routeBusIndex + 0.5) * spacing + jitter + 1) % 1
  const distance = progress * metrics.totalLength

  return {
    metrics,
    distance,
    coordinate: coordinateAtDistance(path, metrics, distance)
  }
}

const animateBusMarker = ({ marker, popup, path, metrics, startDistance = 0, duration = 210000, delay = 0 }) => {
  if (path.length < 2 || !metrics.totalLength) {
    return
  }

  const startTime = performance.now() + delay
  let animationId

  const frame = (time) => {
    if (animationId) {
      busAnimations.delete(animationId)
    }

    const elapsed = Math.max(0, time - startTime)
    const distance = startDistance + ((elapsed / duration) * metrics.totalLength)
    const coordinate = coordinateAtDistance(path, metrics, distance)
    marker.setLngLat(coordinate)

    if (popup.isOpen?.()) {
      popup.setLngLat(coordinate)
    }

    animationId = requestAnimationFrame(frame)
    busAnimations.add(animationId)
  }

  animationId = requestAnimationFrame(frame)
  busAnimations.add(animationId)
}

const addBusMarker = (bus, routeBusIndex = 0, routeBusCount = 1) => {
  const route = props.routes.find((item) => item.id === bus.routeId)
  const path = route ? routeGeometry(route) : []
  const position = distributedBusDistance(path, bus, routeBusIndex, routeBusCount)
  const popup = new maplibregl.Popup({ offset: 22 }).setHTML(`
    <div class="smart-map-popup">
      <strong>${bus.number}</strong>
      <p>${bus.route} - ${bus.location}</p>
      <p>${bus.passengers}/${bus.capacity} penumpang - ETA ${bus.eta}</p>
      <p>Status: ${bus.status}</p>
    </div>
  `)
  const marker = new maplibregl.Marker({
    element: createBusMarker(bus, route),
    anchor: 'center'
  })
    .setLngLat(position.coordinate || nearestRouteCoordinate(bus))
    .setPopup(popup)
    .addTo(map)

  busMarkers.push(marker)
  animateBusMarker({
    marker,
    popup,
    path,
    metrics: position.metrics,
    startDistance: position.distance,
    duration: 200000 + (stableSeed(bus.number || bus.id) % 45) * 1000,
    delay: Number(bus.id?.toString().length || 0) * 180
  })
}

const renderMapLayers = () => {
  if (!map || !map.loaded()) {
    return
  }

  clearMapLayers()
  props.routes.forEach(addRouteLayer)

  const busesByRoute = props.buses.reduce((groups, bus) => {
    const routeBuses = groups.get(bus.routeId) || []
    routeBuses.push(bus)
    groups.set(bus.routeId, routeBuses)
    return groups
  }, new Map())

  props.buses.forEach((bus) => {
    const routeBuses = busesByRoute.get(bus.routeId) || [bus]
    addBusMarker(bus, routeBuses.findIndex((item) => item.id === bus.id), routeBuses.length)
  })
  fitBounds()
  updateMarkerScale()
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.846, -1.249],
    zoom: 13.4,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', renderMapLayers)
  map.on('zoom', updateMarkerScale)
  map.on('moveend', updateMarkerScale)
})

watch(
  () => [props.routes, props.buses, props.transitNetwork],
  () => renderMapLayers(),
  { deep: true }
)

onBeforeUnmount(() => {
  busAnimations.forEach((animationId) => cancelAnimationFrame(animationId))
  busAnimations = new Set()

  if (map) {
    map.remove()
  }
})
</script>

<style>
.transit-bus-marker {
  align-items: center;
  background: var(--bus-color, #0ea5e9);
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  font-size: 13px;
  font-weight: 800;
  height: 34px;
  justify-content: center;
  transform: scale(var(--map-marker-scale, 1));
  transform-origin: center;
  width: 34px;
}

.transit-bus-marker svg {
  height: 17px;
  width: 17px;
}

.transit-bus-marker--delayed {
  background: #f97316;
}
</style>
