import React, { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout, Spin } from 'antd'
import styles from './MainLayout.module.scss'
import Logo from '../components/Logo'
import UserInfo from '../components/UserInfo'
import useLoadUserData from '../hooks/useLoadUserData'
import useNavPage from '../hooks/useNavPage'

const { Header, Content, Footer } = Layout

const MainLayout: FC = () => {
  const { waitingUserData } = useLoadUserData()
  useNavPage(waitingUserData)
  return (
    <Layout>
      {/* 头 */}
      <Header className={styles.header}>
        <div className={styles.left}>
          <Logo />
        </div>
        <div className={styles.right}>
          <UserInfo />
        </div>
      </Header>

      {/* 中间 */}
      <Layout className={styles.main}>
        <Content>
          {waitingUserData ? (
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Spin />
            </div>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>

      {/* 页脚 */}
      <Footer className={styles.footer}>小慕问卷&copy;2026-present,Created by 刘晓露</Footer>
    </Layout>
  )
}

export default MainLayout
