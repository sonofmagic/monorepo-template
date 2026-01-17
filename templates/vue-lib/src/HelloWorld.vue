<script setup lang="ts">
withDefaults(defineProps<{
  msg?: string
}>(), {
  msg: 'Hello World',
})
</script>

<template>
  <div class="hello-world">
    {{ msg }}
  </div>
</template>

<style scoped>
.hello-world {
  padding: 8px;
  color: #222;
  background: #f5f5f5;
  border-radius: 12px;
}
</style>
