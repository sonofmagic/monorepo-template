<script setup lang="ts">
import { ErrorMessage, Field, Form } from 'vee-validate'

function onSubmit(values: any) {
  console.log('Submitted', values)
}

function validateEmail(value: any) {
  // if the field is empty
  if (!value) {
    return 'This field is required'
  }
  // if the field is not a valid email
  const regex = /^[\w.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
  if (!regex.test(value)) {
    return 'This field must be a valid email'
  }
  // All is good
  return true
}
</script>

<template>
  <div>
    <div class="flex items-center justify-center p-8">
      <div class="w-88 border rounded-2xl p-4">
        <Form class="flex flex-col" @submit="onSubmit">
          <Field type="email" name="email" :rules="validateEmail" />
          <ErrorMessage name="email" />
          <button>Sign up for newsletter</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
