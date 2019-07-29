import './index.css'
import 'pepjs'

import App from './App'
import React from 'react'
import ReactDOM from 'react-dom'
import { register } from './serviceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
register()
