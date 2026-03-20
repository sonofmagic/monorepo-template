function escapeForShell(value) {
  return `'${value.replaceAll('\'', '\'\\\'\'')}'`
}

export default {
  '*.{js,jsx,mjs,ts,tsx,mts,cts}': [
    'eslint --fix',
  ],
  '*.vue': [
    'eslint --fix',
    'stylelint --fix --allow-empty-input',
  ],
  '*.{ts,tsx,mts,cts,vue}': (files) => {
    const uniqueFiles = [...new Set(files)]
    if (uniqueFiles.length === 0) {
      return []
    }
    return `node packages/monorepo/dist/cli.mjs verify staged-typecheck ${uniqueFiles.map(escapeForShell).join(' ')}`
  },
  '*.{json,md,mdx,html,yml,yaml}': [
    // 'prettier --with-node-modules --ignore-path .prettierignore --write',
    'eslint --fix',
  ],
  '*.{css,scss,sass,less}': [
    'stylelint --fix --allow-empty-input',
  ],
  // for rust
  // '*.rs': ['cargo fmt --'],
}
