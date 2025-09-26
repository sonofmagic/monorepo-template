import { defineMonorepoConfig } from '@icebreakers/monorepo'

const config = defineMonorepoConfig({
  // commands: {
  //   create: {
  //     defaultTemplate: 'unbuild',
  //     renameJson: false,
  //   },
  //   upgrade: {
  //     skipOverwrite: false,
  //     // mergeTargets: false,
  //     // targets: ['.github'],
  //   },
  //   clean: {
  //     // autoConfirm: true,
  //     // ignorePackages: ['example-package']
  //   },
  //   sync: {
  //     // command: 'cnpm sync {name}',
  //   },
  //   mirror: {
  //     // env: {
  //     //   NODEJS_ORG_MIRROR: 'https://npmmirror.com/mirrors/node',
  //     // },
  //   },
  // },
})

export default config
