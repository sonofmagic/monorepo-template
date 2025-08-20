<script setup lang="ts">
withDefaults(defineProps<{
  msg?: string
}>(), {
  msg: 'Hello World',
})
</script>

<template>
  <div class="p-2">
    <div class="border p-2 rounded-2xl">
      {{ msg }}
    </div>
  </div>
</template>

<style scoped>
.a {
  color: aliceblue;
}
</style>
