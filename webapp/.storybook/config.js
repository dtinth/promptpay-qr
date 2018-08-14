import '../src/index.css'
import 'pepjs'

import { configure } from '@storybook/react'

function loadStories () {
  require('../src/Flipper.storybook')
  require('../src/QRCode.storybook')
  require('../src/SlotSelector.storybook')
}

configure(loadStories, module)
