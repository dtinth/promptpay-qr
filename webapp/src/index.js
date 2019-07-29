import './index.css'
import 'pepjs'

import App from './App'
import React from 'react'
import ReactDOM from 'react-dom'
import { register } from './serviceWorker'

ReactDOM.render(<App />, document.getElementById('root'))

register({
  onSuccess() {
    // TODO: Display information that the app can be used offline
  },
  onUpdate() {
    // TODO: Display information that an update is available
  },
})

// var installPWA
window.addEventListener('beforeinstallprompt', function(e) {
  // installPWA = () => e.prompt()
  // TODO: Display information that the app can be installed
})
