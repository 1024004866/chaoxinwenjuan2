import React, { FC, useEffect, useState } from 'react'
import { Space, Typography } from 'antd'
import { FormOutlined } from '@ant-design/icons'
import styles from './Logo.module.scss'
import useGetUserInfo from '../hooks/useGetUserInfo'
import { Link } from 'react-router-dom'
// ✅ 正确：MANAGE（不是MANANGE），useGetUserInfo（大写I）
import { HOME_PATHNAME, MANAGE_INDEX_PATHNAME } from '../router'
const { Title } = Typography

const Logo: FC = () => {
  const { username } = useGetUserInfo()
  const [pathname, setPathname] = useState(HOME_PATHNAME)

  useEffect(() => {
    if (username) {
      setPathname(MANAGE_INDEX_PATHNAME) // ✅ 这里也改
    }
  }, [username])

  return (
    <div className={styles.container}>
      <Link to={pathname}>
        <Space align="center">
          <Title style={{ margin: 0 }}>
            <FormOutlined />
          </Title>
          <Title style={{ margin: 0 }}>小慕问卷</Title>
        </Space>
      </Link>
    </div>
  )
}

export default Logo