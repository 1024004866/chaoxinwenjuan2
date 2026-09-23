import React, { FC, useEffect, useRef, useState } from 'react'
import { useTitle, useDebounceFn, useRequest } from 'ahooks'
import QuestionCard from '../../components/QuestionCard'
import styles from './common.module.scss'
import { useSearchParams } from 'react-router-dom'
import { getQuestionListService } from '../../services/question'
import { Typography, Spin, Empty } from 'antd'
import ListSearch from '../../components/ListSearch'
import { LIST_PAGE_SIZE, LIST_SEARCH_PARAM_KEY } from '../../constant/index'

const { Title } = Typography

const List: FC = () => {
  useTitle('小慕问卷-我的问卷')
  const [list, setList] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get(LIST_SEARCH_PARAM_KEY) || ''

  // 关键词变化 → 重置列表
  useEffect(() => {
    setList([])
    setPage(1)
    setTotal(0)
  }, [keyword])

  // 加载数据
  const { run: load, loading } = useRequest(
    async () => {
      const data = await getQuestionListService({
        page,
        pageSize: LIST_PAGE_SIZE,
        keyword,
      })
      return data
    },
    {
      manual: true,
      onSuccess(result) {
        const { list: newList = [], total = 0 } = result // ✅ 这里修复！小写 list
        setList(prev => [...prev, ...newList])
        setTotal(total)
        setPage(prev => prev + 1)
      },
    }
  )

  // 防抖加载更多
  const containerRef = useRef<HTMLDivElement>(null)
  const { run: tryLoadMore } = useDebounceFn(
    () => {
      const el = containerRef.current
      if (!el) return
      const { bottom } = el.getBoundingClientRect()
      if (bottom <= window.innerHeight) {
        load()
      }
    },
    { wait: 500 }
  )

  // 初始化和搜索条件变化时加载一次，避免两个 effect 在首次渲染时重复请求
  useEffect(() => {
    load()
  }, [searchParams, load])

  // 滚动监听
  useEffect(() => {
    if (total === 0 || list.length >= total) return
    window.addEventListener('scroll', tryLoadMore)
    return () => window.removeEventListener('scroll', tryLoadMore)
  }, [list, total, tryLoadMore])

  // 底部提示
  const renderFooter = () => {
    if (loading) return <Spin />
    if (list.length === 0) return <Empty description="暂无数据" />
    if (list.length >= total) return <span>没有更多了</span>
    return <span>加载中...</span>
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.left}>
          <Title level={3}>我的问卷</Title>
        </div>
        <div className={styles.right}>
          <ListSearch />
        </div>
      </div>

      <div className={styles.content}>
        {list.map(q => (
          <QuestionCard key={q._id} {...q} />
        ))}
      </div>

      <div className={styles.footer}>
        <div ref={containerRef}>{renderFooter()}</div>
      </div>
    </>
  )
}

export default List
