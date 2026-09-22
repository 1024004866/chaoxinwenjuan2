import React, { FC } from 'react'
import { Typography, Spin, Empty } from 'antd'
import QuestionCard from '../components/QuestionCard'
import ListSearch from '../components/ListSearch'
import ListPage from '../components/ListPage'
import useLoadQuestionListData from '../hooks/useLoadQuestionListData'
import styles from './List.module.scss'

const { Title } = Typography

const List: FC = () => {
  // 使用 hook 获取数据（isDeleted: false 表示不是回收站）
  const { data, loading, error } = useLoadQuestionListData({ isDeleted: false })
  const { list = [], total = 0 } = data || {}

  // 加载中
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <Spin size="large" />
      </div>
    )
  }

  // 错误处理
  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <Typography.Text type="danger">加载失败，请刷新重试</Typography.Text>
      </div>
    )
  }

  return (
    <>
      {/* 表头 */}
      <div className={styles.header}>
        <div className={styles.left}>
          <Title level={3}>我的问卷</Title>
        </div>
        <div className={styles.right}>
          <ListSearch />
        </div>
      </div>

      {/* 内容 */}
      <div className={styles.content}>
        {list.length === 0 ? (
          <Empty description="暂无数据" />
        ) : (
          list.map((q: any) => {
            const { _id } = q
            return <QuestionCard key={_id} {...q} />
          })
        )}
      </div>

      {/* 页脚 - 分页 */}
      <div className={styles.footer}>{total > 0 && <ListPage total={total} />}</div>
    </>
  )
}

export default List
