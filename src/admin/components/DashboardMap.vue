<template>
  <PublicMap mode="traffic" :traffic="traffic" :road-network="roadNetwork" />
</template>

<script setup>
import PublicMap from '../../public/components/PublicMap.vue'
import { trafficLocations } from '../../shared/data/mobilityData'
import { emptyRoadNetwork } from '../../shared/data/roadNetworkData'

defineProps({
  traffic: {
    type: Array,
    default: () => trafficLocations
  },
  roadNetwork: {
    type: Object,
    default: () => emptyRoadNetwork
  }
})
</script>
