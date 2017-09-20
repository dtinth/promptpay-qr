import { configure } from '@storybook/react'

function loadStories () {
  require('../src/Flipper.storybook')
}

configure(loadStories, module)
