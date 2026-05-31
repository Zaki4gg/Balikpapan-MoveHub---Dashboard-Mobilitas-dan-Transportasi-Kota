<template>
  <CctvGallery variant="public" @back="backToTraffic" />
</template>

<script setup>
import CctvGallery from '../../shared/components/CctvGallery.vue'

const backToTraffic = () => {
  window.location.hash = '#/traffic'
}
</script>
