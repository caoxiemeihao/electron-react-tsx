import React from 'react'
import LayoutBase from '@root/src-render/components/layout/base'
import Routes from './routes'
import './app.normal.less'

class App extends React.Component {

  render() {
    return <div className='app-container'>
      <LayoutBase>
        <Routes />
      </LayoutBase>
    </div>
  }
}

export default App
