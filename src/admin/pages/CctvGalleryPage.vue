<template>
  <CctvGallery variant="admin" @back="$emit('backToTraffic')" />
</template>

<script setup>
import CctvGallery from '../../shared/components/CctvGallery.vue'

defineEmits(['backToTraffic'])
</script>
