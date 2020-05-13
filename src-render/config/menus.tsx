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
    name: '指南',
    icon: <AreaChartOutlined />,
  },
  {
    path: '/excel-down',
    name: 'POD 图片下载',
    icon: <FileExcelOutlined />,
  },
  {
    path: '/goods-source',
    name: '搜品',
    icon: <PictureOutlined />,
  },
]

export default menus
