import React, { FC, useEffect, useState } from 'react'
import { Tabs } from 'antd'
import { FileTextOutlined, SettingOutlined } from '@ant-design/icons'
import ComponentProp from './ComponentProp'
import PageSetting from './PageSetting'
import useGetComponentInfo from '../../../hooks/useGetComponentInfo'
//枚举
enum TAB_KEYS {
  PROP_KEY = 'prop',
  SETTING_KEY = 'setting',
}
const RightPanel: FC = () => {
  const [activeKey, setActiveKey] = useState<TAB_KEYS>(TAB_KEYS.PROP_KEY) 
  const { selectedId } = useGetComponentInfo()
  useEffect(() => {
    if (selectedId) {
      setActiveKey(TAB_KEYS.PROP_KEY)
    }
    else setActiveKey(TAB_KEYS.SETTING_KEY)  
  } , [selectedId]) 
  
  // 定义 Tabs 的配置项数组
  const tabsItems = [
    {
      key: TAB_KEYS.PROP_KEY,
      label: (
        <span>
          <FileTextOutlined />
          属性
        </span>
      ),
      children: <ComponentProp/>,
    },
    {
      key: TAB_KEYS.SETTING_KEY,
      label: (
        <span>
          <SettingOutlined />
          页面设置
        </span>
      ),
      children: <PageSetting/>,
    },
  ]

  return (
    <Tabs
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key as TAB_KEYS)}
      items={tabsItems}
    />
  )
}

export default RightPanel