/**
 * 基本布局文件
 */
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons'
import menus, { IMenu } from '@render/config/menus'
import cls from 'classnames'
import { ipcRenderer } from 'electron'
import styles from './base.mod.less'

const { Sider, Header, Content } = Layout

const BaseLayout: React.FC = props => {
  const history = useHistory()
  const location = useLocation()
  const [collapsed, setCollapsed] = React.useState<boolean>(false)

  // const [keys, setKeys] = React.useState<Array<string>>([])
  // React.useEffect(() => {
  //   setKeys([location.pathname])
  // }, [location.pathname])
  const keys = React.useMemo(() => [location.pathname], [location.pathname])

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])
  const clickMenu = (menu: IMenu) => {
    history.push(menu.path)
  }

  return (
    <Layout className='h-100'>
      <Sider className='bg-white' collapsed={collapsed}>
        <div className={styles.logo}>
          <h1>草</h1>
        </div>
        <Menu mode="inline" selectedKeys={keys}>
          {menus.map(menu => <Menu.Item
            key={menu.path}
            icon={menu.icon}
            onClick={() => clickMenu(menu)}
          >
            {menu.name}
          </Menu.Item>)}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="bg-white p-0">
          {React.createElement(collapsed
            ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'ml-2',
            onClick: toggle,
          })}
          <Button size="small" className="ml-3" onClick={() => ipcRenderer.send('toggle-devtools')}>
            切换控制台
          </Button>
        </Header>
        <Content className={cls("bg-white m-3 p-3 h-100", styles.content)}>
          {props.children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default BaseLayout
