import React from 'react'
import { Route, RouteProps, Switch } from 'react-router-dom'
import Dashboard from './dashboard/dashboard'

const config: Array<RouteProps> = [
  { path: '/dashboard', component: Dashboard },
]

/**
 * 这个生成路由是平级的，不是子路由
 * 只不是上面的写法像是子路由 😁
 * @param route 
 */
const generateRoutes = (
  { path, component, children, exact = true }: RouteProps, deep: Array<string> = []
) => {
  let element: React.ReactElement
  const _path = [path, ...deep].join('')
  if (Array.isArray(children) && children.length) {
    element = <>{
      children.map(rot => generateRoutes(rot as RouteProps, deep.concat(path as string)))
    }</>
    children.forEach(rot => generateRoutes(rot as RouteProps, deep.concat(path as string)))
  } else {
    element = <Route path={_path} component={component} exact={exact} key={_path} />
  }
  return element
}

const routes = config.map(route => generateRoutes(route))

export default () => <Switch>{routes}</Switch>
