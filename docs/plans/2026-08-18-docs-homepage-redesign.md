# repoctl documentation homepage redesign

## Design read

The homepage is a task-first entry point for pnpm and Turborepo developers. The redesign keeps the existing documentation architecture and brand while giving the page a brighter, work-focused developer-tool presentation.

- Design variance: 6
- Motion intensity: 3
- Visual density: 5
- Foundation: VitePress, Vue 3, and native CSS

## Decisions

- Keep the current routes, navigation labels, section IDs, and bilingual content structure.
- Use the real `repoctl doctor` screenshot as the hero visual instead of constructing a simulated terminal.
- Shorten the hero message and provide direct paths to getting started and command reference.
- Give each homepage section a distinct layout: asymmetric hero, task grid, step rail, workflow split, and tiered navigation grid.
- Keep cobalt as the only interface accent and use one 8px radius scale for interactive and framed elements.
- Support the VitePress light and dark themes and disable decorative transitions for reduced-motion users.

## Responsive behavior

- At 1024px and above, the hero uses two columns and the screenshot fills the right side.
- From 768px to 1023px, the hero stacks while task and navigation layouts retain useful width.
- Below 768px, all multi-column sections become single-column, actions remain at least 48px tall, and the screenshot is cropped for legibility.

## Verification

- Build the complete workspace before running lint, type checks, type tests, and tests.
- Validate English and Chinese locale parity.
- Run Stylelint on all changed homepage CSS.
- Inspect both locales in light and dark themes at 1440x900, 768x1024, and 390x844.
- Confirm keyboard focus, link targets, contrast, overflow, image stability, and console output.
