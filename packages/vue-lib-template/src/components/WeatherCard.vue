<!-- WeatherCard.vue -->
<script setup>
import { CloudLightningIcon, CloudSnowIcon, SunIcon, WindIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps({ type: String })

const isCelsius = ref(true)

function toggleTempUnit() {
  isCelsius.value = !isCelsius.value
}

const weatherData = {
  sunny: { label: '晴天', tempC: 28, icon: SunIcon },
  windy: { label: '大风', tempC: 22, icon: WindIcon },
  storm: { label: '暴雨', tempC: 19, icon: CloudLightningIcon },
  snow: { label: '暴雪', tempC: -3, icon: CloudSnowIcon },
}

const current = weatherData[props.type]
const label = current.label
const icon = current.icon

const displayTemp = computed(() =>
  isCelsius.value ? `${current.tempC}°C` : `${Math.round(current.tempC * 1.8 + 32)}°F`,
)
</script>

<template>
  <div
    class="relative w-64 h-72 bg-white/20 rounded-2xl shadow-xl backdrop-blur-md transition-transform hover:scale-105 cursor-pointer overflow-hidden"
    @click="toggleTempUnit"
  >
    <div class="absolute top-3 right-3 text-white text-sm">
      {{ label }}
    </div>
    <div class="flex flex-col items-center justify-center h-full text-white">
      <component :is="icon" class="w-20 h-20 mb-4" />
      <div class="text-5xl font-semibold">
        {{ displayTemp }}
      </div>
      <div class="text-xl mt-2">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
div {
  transition: all 0.3s ease-in-out;
}
</style>
