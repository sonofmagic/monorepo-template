<script setup lang="ts">
withDefaults(defineProps<{
  msg?: string
}>(), {
  msg: 'Hello11 World',
})
</script>

<template>
  <div>
    {{ msg }}
  </div>
</template>

<style scoped>

</style>
