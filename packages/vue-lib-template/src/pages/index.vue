<script setup lang="ts">
import { HeadlessForm, HeadlessFormItem } from '~/index'
</script>

<template>
  <div>
    <HeadlessForm>
      <HeadlessFormItem />
      <div>
        <HeadlessFormItem />
      </div>

      <div>
        <div>
          <HeadlessFormItem />
        </div>
        <HeadlessForm>
          <HeadlessFormItem />
        </HeadlessForm>
      </div>

      <HeadlessFormItem>
        <HeadlessForm>
          <HeadlessFormItem />
        </HeadlessForm>
      </HeadlessFormItem>
    </HeadlessForm>
  </div>
</template>

<style scoped>

</style>
