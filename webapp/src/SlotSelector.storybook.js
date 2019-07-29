import React from 'react'
import SlotSelector from './SlotSelector'
import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'

storiesOf('SlotSelector', module).add('selector', () => (
  <div
    style={{
      position: 'relative',
      margin: '20px auto',
      width: 320,
      height: 320,
    }}
  >
    <SlotSelector
      active={2}
      onSelect={action('onSelect')}
      data={{
        1: '',
        2: '0000000000',
        3: '0000000000000',
        4: '000000000000000',
      }}
    />
  </div>
))
