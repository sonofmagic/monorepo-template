<script setup lang="ts">
import { Field } from 'vee-validate'

const props = withDefaults(
  defineProps<{
    prop: string
  }>(),
  {},
)
</script>

<template>
  <Field v-slot="$scope" :name="props.prop">
    <slot v-bind="$scope" />
    <span v-if="$scope.errorMessage">⛔️ {{ $scope.errorMessage }}</span>
    <span v-if="$scope.meta.valid && $scope.meta.touched">✅ Field is valid</span>
  </Field>
</template>
