import type { Component } from 'vue'
import { expectAssignable } from 'tsd'
// eslint-disable-next-line antfu/no-import-dist
import { HelloWorld } from '../dist/index.js'

expectAssignable<Component>(HelloWorld)
