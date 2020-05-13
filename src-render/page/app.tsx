import React, { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import LayoutBase from '@render/components/layout/base'
import Routes from '../config/routes'
import menus from '../config/menus'
import './app.less'

const App: React.FC = props => {
  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      history.push(menus[0].path)
    }
  }, [])

  return <div className='app-container'>
    <LayoutBase>
      <Routes />
    </LayoutBase>
  </div>
}

export default App
