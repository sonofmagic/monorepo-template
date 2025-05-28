<script setup lang="ts">
withDefaults(defineProps<{
  msg?: string
}>(), {
  msg: 'Hello World',
})
</script>

<template>
  <div>
    {{ msg }}
  </div>
</template>

<style scoped>
.a {
  color: aliceblue;
}
</style>
