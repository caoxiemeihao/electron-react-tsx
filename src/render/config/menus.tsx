/**
 * 左侧菜单配置
 */
import React from 'react'
import {
  AreaChartOutlined,
  FileExcelOutlined,
  PictureOutlined,
} from '@ant-design/icons'

export interface IMenu {
  path: string
  name: string
  icon?: React.ReactNode
}

const menus: Array<IMenu> = [
  {
    path: '/dashboard',
    name: '项目介绍',
    icon: <AreaChartOutlined />,
  },
  {
    path: '/excel-down',
    name: 'excel 解析',
    icon: <FileExcelOutlined />,
  },
  {
    path: '/goods-source',
    name: '商品爬虫',
    icon: <PictureOutlined />,
  },
]

export default menus
