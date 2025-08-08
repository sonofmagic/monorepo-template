<script setup lang="ts">
import type { FormItemRule } from 'element-plus'
import { Form } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'

type Arrayable<T> = T | T[]

const props = withDefaults(
  defineProps<{
    model?: Record<string, any>
    rules?: Partial<Record<string, Arrayable<FormItemRule>>>
  }>(),
  {},
)

const formRef = useTemplateRef('formRef')

const validationSchema = computed(() => {
  return props.rules
})

const initialValues = computed(() => {
  return {

  }
})

function validate() {
  formRef.value?.validate()
}

defineExpose({
  validate,
})
</script>

<template>
  <Form ref="formRef" v-slot="$scope" :validation-schema="validationSchema" :initial-values="initialValues">
    <slot v-bind="$scope" />
  </Form>
</template>
