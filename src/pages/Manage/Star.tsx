import React, { FC } from 'react'
import { useTitle } from 'ahooks'
import QuestionCard from '../../components/QuestionCard'
import styles from './common.module.scss'
import { Spin, Typography, Empty } from 'antd'
import ListSearch from '../../components/ListSearch'
import useLoadQuestionListData from '../../hooks/useLoadQuestionListData'
import ListPage from '../../components/ListPage'

const { Title } = Typography

const Star: FC = () => {
  useTitle('小慕问卷 - 星标问卷')
  const { data = {}, loading } = useLoadQuestionListData({ isStar: true })

  const { list = [], total = 0 } = data

  return (
    <>
      <div className={styles.header}>
        <div className={styles.left}>
          <Title level={3}>星标问卷</Title>
        </div>
        <div className={styles.right}>
          <ListSearch />
        </div>
      </div>

      <div className={styles.content}>
        {loading && (
          <div style={{ textAlign: 'center' }}>
            <Spin />
          </div>
        )}
        {!loading && list.length === 0 && <Empty description="暂无数据" />}
        {list.map((q: any) => {
          const { _id } = q
          return <QuestionCard key={_id} {...q} />
        })}
      </div>

      <div className={styles.footer}>
        <ListPage total={total} />
      </div>
    </>
  )
}

export default Star
