// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettierConfig from 'eslint-config-prettier'

export default withNuxt(
  // Prettier integration: turns off ESLint rules that conflict with Prettier.
  // Prettier handles formatting; ESLint handles code quality.
  prettierConfig,
)
