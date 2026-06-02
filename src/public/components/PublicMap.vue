<template>
  <div class="card h-[30rem] overflow-hidden">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-cyan-200/60 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{{ eyebrow }}</p>
        <h3 class="mt-1 font-bold text-slate-950">{{ title }}</h3>
        <p class="mt-1 text-xs font-semibold text-slate-500">{{ subtitle }}</p>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { activeBuses, trafficLocations, transitRoutes } from '../../shared/data/mobilityData'
import { emptyRoadNetwork, emptyTransitNetwork } from '../../shared/data/roadNetworkData.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'overview'
  },
  traffic: {
    type: Array,
    default: () => trafficLocations
  },
  roadNetwork: {
    type: Object,
    default: () => emptyRoadNetwork
  },
  routes: {
    type: Array,
    default: () => transitRoutes
  },
  transitNetwork: {
    type: Object,
    default: () => emptyTransitNetwork
  },
  buses: {
    type: Array,
    default: () => activeBuses
  },
  userLocation: {
    type: Object,
    default: null
  }
})

const mapContainer = ref(null)
let map
let markers = []
let activeLayers = []
let markerAnimations = new Set()

const title = computed(() => {
  if (props.mode === 'traffic') {
    return 'Jalur Kemacetan'
  }

  if (props.mode === 'transit') {
    return 'Rute Bacitra'
  }

  return 'Balikpapan'
})

const eyebrow = computed(() => {
  if (props.mode === 'traffic') {
    return 'B-Connect'
  }

  if (props.mode === 'transit') {
    return 'Bacitra'
  }

  return 'MapLibre'
})

const subtitle = computed(() => {
  if (props.mode === 'traffic') {
    return 'Simulasi CCTV + kondisi ruas'
  }

  if (props.mode === 'transit') {
    return 'Rute dan posisi armada simulasi'
  }

  return 'OSM GeoJSON lokal'
})

const legendItems = computed(() => {
  if (props.mode === 'transit') {
    return [
      ...props.routes.map((route) => ({ label: route.shortName, color: route.color })),
      { label: 'Armada Bacitra', color: '#0ea5e9' }
    ]
  }

  return [
    { label: 'Kemacetan Berat', color: '#ef4444' },
    { label: 'Kemacetan Sedang', color: '#f59e0b' },
    { label: 'Lancar', color: '#10b981' }
  ]
})

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

const roadFeatureById = () => new Map((props.roadNetwork?.features || []).map((feature) => [feature.id, feature]))
const transitFeatureByRouteId = () => new Map((props.transitNetwork?.features || []).map((feature) => [feature.properties?.routeId, feature]))

const trafficSegment = (location) => {
  const feature = roadFeatureById().get(location.roadFeatureId)
  return feature?.geometry?.coordinates?.length ? feature.geometry.coordinates : location.segment || []
}

const transitSegment = (route) => {
  const feature = transitFeatureByRouteId().get(route.id)
  return feature?.geometry?.coordinates?.length ? feature.geometry.coordinates : route.path || []
}

const nearestRouteCoordinate = (bus) => {
  const route = props.routes.find((item) => item.id === bus.routeId)
  const path = route ? transitSegment(route) : []

  if (!path.length) {
    return bus.coordinates
  }

  return path.reduce((nearest, coordinate) => {
    const distance = Math.hypot(coordinate[0] - bus.coordinates[0], coordinate[1] - bus.coordinates[1])
    return distance < nearest.distance ? { coordinate, distance } : nearest
  }, { coordinate: path[0], distance: Infinity }).coordinate
}

const createMarkerElement = ({ color, label }) => {
  const marker = document.createElement('button')
  marker.className = 'smart-map-marker'
  marker.style.background = color
  marker.textContent = label
  marker.type = 'button'
  return marker
}

const createBusMarkerElement = (bus, route) => {
  const marker = document.createElement('button')
  marker.className = bus.status.startsWith('Delayed') ? 'smart-map-bus-marker smart-map-bus-marker--delayed' : 'smart-map-bus-marker'
  marker.type = 'button'
  marker.style.setProperty('--bus-color', route?.color || '#0ea5e9')
  marker.setAttribute('aria-label', `${bus.number}, ${bus.route}, ${bus.status}`)
  marker.innerHTML = `
    <span class="smart-map-bus-marker__pulse"></span>
    <span class="smart-map-bus-marker__body">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="4" width="14" height="13" rx="3"></rect>
        <path d="M8 8h8M8 12h8M8 20l1.5-3M16 20l-1.5-3"></path>
      </svg>
    </span>
    <span class="smart-map-bus-marker__label">${bus.number}</span>
  `
  return marker
}

const markerPopupHtml = ({ title: markerTitle, description, meta }) => `
  <div class="smart-map-popup">
    <strong>${markerTitle}</strong>
    <p>${description}</p>
    ${meta ? `<p class="smart-map-popup__meta">${meta}</p>` : ''}
  </div>
`

const bindInteractivePopup = (element, marker, popup) => {
  let tapOpen = false

  const openPopup = () => {
    popup.setLngLat(marker.getLngLat()).addTo(map)
  }

  const closePopup = () => {
    if (!tapOpen) {
      popup.remove()
    }
  }

  element.addEventListener('mouseenter', openPopup)
  element.addEventListener('mouseleave', closePopup)
  element.addEventListener('focus', openPopup)
  element.addEventListener('blur', () => {
    tapOpen = false
    popup.remove()
  })
  element.addEventListener('click', () => {
    tapOpen = !tapOpen
    if (tapOpen) {
      openPopup()
    } else {
      popup.remove()
    }
  })
  element.addEventListener('touchstart', (event) => {
    event.preventDefault()
    tapOpen = !tapOpen
    if (tapOpen) {
      openPopup()
    } else {
      popup.remove()
    }
  }, { passive: false })
}

const clearMapLayers = () => {
  markerAnimations.forEach((animationId) => cancelAnimationFrame(animationId))
  markerAnimations = new Set()

  markers.forEach((marker) => marker.remove())
  markers = []

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

const addLineLayer = ({ id, coordinates, color, opacity = 0.9, width = 5, dashArray, properties = {} }) => {
  if (!coordinates.length) {
    return
  }

  const sourceId = `${id}-source`
  const casingLayerId = `${id}-casing`
  const layerId = `${id}-line`

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties,
      geometry: {
        type: 'LineString',
        coordinates
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
      'line-width': width + 6,
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
      'line-color': color,
      'line-width': width,
      'line-opacity': opacity,
      ...(dashArray ? { 'line-dasharray': dashArray } : {})
    }
  })

  activeLayers.push({ layerIds: [layerId, casingLayerId], sourceId })
}

const addMarker = ({ coordinates, color = '#0ea5e9', label = 'B', title: markerTitle, description, meta }) => {
  const element = createMarkerElement({ color, label })
  const marker = new maplibregl.Marker({
    element,
    anchor: 'center'
  })
    .setLngLat(coordinates)
    .addTo(map)

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 24 })
    .setHTML(markerPopupHtml({ title: markerTitle, description, meta }))

  bindInteractivePopup(element, marker, popup)

  markers.push(marker)
}

const interpolateCoordinate = (from, to, progress) => [
  from[0] + ((to[0] - from[0]) * progress),
  from[1] + ((to[1] - from[1]) * progress)
]

const nearestPathIndex = (path, coordinate) => {
  if (!path.length || !coordinate) {
    return 0
  }

  return path.reduce((nearest, point, index) => {
    const distance = Math.hypot(point[0] - coordinate[0], point[1] - coordinate[1])
    return distance < nearest.distance ? { index, distance } : nearest
  }, { index: 0, distance: Infinity }).index
}

const animateBusMarker = ({ marker, popup, path, startCoordinate, delay = 0 }) => {
  if (path.length < 2) {
    return
  }

  let segmentIndex = nearestPathIndex(path, startCoordinate)
  if (segmentIndex >= path.length - 1) {
    segmentIndex = 0
  }

  let progress = 0
  let lastTime = performance.now() + delay

  let animationId

  const frame = (time) => {
    if (animationId) {
      markerAnimations.delete(animationId)
    }

    const delta = Math.max(0, time - lastTime)
    lastTime = time
    progress += delta / 4200

    if (progress >= 1) {
      progress = 0
      segmentIndex = (segmentIndex + 1) % (path.length - 1)
    }

    const coordinate = interpolateCoordinate(path[segmentIndex], path[segmentIndex + 1], progress)
    marker.setLngLat(coordinate)

    if (popup.isOpen?.()) {
      popup.setLngLat(coordinate)
    }

    animationId = requestAnimationFrame(frame)
    markerAnimations.add(animationId)
  }

  animationId = requestAnimationFrame(frame)
  markerAnimations.add(animationId)
}

const addMovingBusMarker = (bus) => {
  const route = props.routes.find((item) => item.id === bus.routeId)
  const path = route ? transitSegment(route) : []
  const coordinates = nearestRouteCoordinate(bus)
  const element = createBusMarkerElement(bus, route)
  const marker = new maplibregl.Marker({
    element,
    anchor: 'center'
  })
    .setLngLat(coordinates)
    .addTo(map)

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 26 })
    .setHTML(markerPopupHtml({
      title: bus.number,
      description: `${bus.route} - ${bus.location}`,
      meta: `${bus.passengers}/${bus.capacity} penumpang - ETA ${bus.eta} - ${bus.status}`
    }))

  bindInteractivePopup(element, marker, popup)
  markers.push(marker)
  animateBusMarker({ marker, popup, path, startCoordinate: coordinates, delay: Number(bus.id?.toString().length || 0) * 120 })
}

const fitBounds = () => {
  const bounds = new maplibregl.LngLatBounds()

  if (props.mode === 'transit') {
    props.routes.forEach((route) => transitSegment(route).forEach((coordinate) => bounds.extend(coordinate)))
    props.buses.forEach((bus) => bounds.extend(nearestRouteCoordinate(bus)))
    if (props.userLocation?.coordinates) {
      bounds.extend(props.userLocation.coordinates)
    }
  } else {
    props.traffic.forEach((location) => {
      const segment = trafficSegment(location)

      if (segment.length) {
        segment.forEach((coordinate) => bounds.extend(coordinate))
      } else {
        bounds.extend(location.coordinates)
      }
    })
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 70, right: 110, bottom: 70, left: 110 },
      maxZoom: 14.5,
      duration: 700
    })
  }
}

const renderTraffic = () => {
  props.traffic.forEach((location) => {
    const segment = trafficSegment(location)
    addLineLayer({
      id: `public-traffic-${location.id}`,
      coordinates: segment,
      color: location.color,
      width: 6,
      properties: { name: location.name, density: location.density }
    })

    addMarker({
      coordinates: location.coordinates,
      color: location.color,
      label: `${location.density}%`,
      title: location.name,
      description: `${location.description} - kepadatan ${location.density}%`
    })
  })
}

const renderTransit = () => {
  props.routes.forEach((route) => {
    addLineLayer({
      id: `public-transit-${route.id}`,
      coordinates: transitSegment(route),
      color: route.color,
      opacity: route.status === 'active' ? 0.88 : 0.62,
      width: route.appStyle ? 6 : 5,
      dashArray: route.appStyle ? [2.8, 1.2] : undefined,
      properties: { name: route.name }
    })
  })

  props.buses.forEach((bus) => {
    addMovingBusMarker(bus)
  })

  if (props.userLocation?.coordinates) {
    addMarker({
      coordinates: props.userLocation.coordinates,
      color: '#2563eb',
      label: '',
      title: props.userLocation.name,
      description: props.userLocation.description,
      meta: 'Titik simulasi lokasi pengguna'
    })
  }
}

const renderMapLayers = () => {
  if (!map || !map.loaded()) {
    return
  }

  clearMapLayers()

  if (props.mode === 'transit') {
    renderTransit()
  } else {
    renderTraffic()
  }

  fitBounds()
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.846, -1.249],
    zoom: 13,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', renderMapLayers)
})

watch(
  () => [props.mode, props.traffic, props.roadNetwork, props.routes, props.transitNetwork, props.buses, props.userLocation],
  () => renderMapLayers(),
  { deep: true }
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style>
.smart-map-marker {
  align-items: center;
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  font-size: 11px;
  font-weight: 800;
  height: 36px;
  justify-content: center;
  min-width: 36px;
  padding: 0 4px;
}

.smart-map-bus-marker {
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  position: relative;
}

.smart-map-bus-marker__pulse {
  animation: bus-marker-pulse 1.8s ease-out infinite;
  background: color-mix(in srgb, var(--bus-color, #0ea5e9) 42%, transparent);
  border-radius: 999px;
  height: 42px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 42px;
}

.smart-map-bus-marker__body {
  align-items: center;
  background: var(--bus-color, #0ea5e9);
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: flex;
  height: 36px;
  justify-content: center;
  position: relative;
  width: 36px;
}

.smart-map-bus-marker__body svg {
  height: 18px;
  width: 18px;
}

.smart-map-bus-marker__label {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.14);
  color: #0f172a;
  font-size: 0.62rem;
  font-weight: 900;
  line-height: 1;
  max-width: 72px;
  overflow: hidden;
  padding: 0.22rem 0.42rem;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.smart-map-bus-marker--delayed .smart-map-bus-marker__body {
  background: #f97316;
}

.smart-map-bus-marker:hover .smart-map-bus-marker__body,
.smart-map-bus-marker:focus-visible .smart-map-bus-marker__body {
  transform: translateY(-2px) scale(1.04);
}

.smart-map-popup {
  color: #0f172a;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  min-width: 180px;
}

.smart-map-popup p {
  color: #475569;
  margin: 6px 0 0;
}

.smart-map-popup__meta {
  color: #dc2626 !important;
  font-weight: 800;
}

@keyframes bus-marker-pulse {
  0% {
    opacity: 0.45;
    transform: translate(-50%, -50%) scale(0.65);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.35);
  }
}
</style>
