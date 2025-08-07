<script setup lang="ts">
import { DynamicForm } from '~/index'

const formSchema = {
  fields: [
    {
      label: 'Your Name',
      name: 'name',
      as: 'input',
    },
    {
      label: 'Your Email',
      name: 'email',
      as: 'input',
    },
    {
      label: 'Your Password',
      name: 'password',
      as: 'input',
      type: 'password',
    },
  ],
}
</script>

<template>
  <DynamicForm :schema="formSchema" />
</template>

<style lang="scss" scoped>

</style>
