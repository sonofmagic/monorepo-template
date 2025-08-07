<script setup lang="ts">
import { Field, Form } from 'vee-validate'

defineProps<{
  schema: {
    fields: {
      name: string
      label: string
      as: string
    }[]
  }
}>()
</script>

<template>
  <Form>
    <div
      v-for="field in schema.fields" :key="field.name"
    >
      <label :for="field.name">{{ field.label }}</label>
      <Field :id="field.name" :as="field.as" :name="field.name" />
    </div>
    <button>Submit</button>
  </Form>
</template>

<style scoped>

</style>
