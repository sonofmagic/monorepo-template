<script setup lang="ts">
function onSubmit() {
  console.log('Submitted')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-center p-8">
      <div class="w-88 border rounded-2xl">
        <form class="flex flex-col" novalidate @submit.prevent="onSubmit">
          <input type="email" name="email">
          <button>Sign up for newsletter</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
