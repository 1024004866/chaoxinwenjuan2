import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography } from 'antd'
import { MANAGE_INDEX_PATHNAME } from '../router'
import styles from './Home.module.scss'
// import '../_mock/index.ts'
// import axios from 'axios'
const { Title, Paragraph } = Typography
const Home: FC = () => {
  const nav = useNavigate()
  // function clickHandler() {
  //   nav('/login')
  // }
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <Title>问卷调查 | 在线投票</Title>
        <Paragraph>设计问卷、公开收集、实时统计，一站式完成</Paragraph>
        <Button type="primary" onClick={() => nav(MANAGE_INDEX_PATHNAME)}>
          开始使用
        </Button>
      </div>
    </div>
  )
}
export default Home
