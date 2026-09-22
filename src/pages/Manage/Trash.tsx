import React, { FC, useState } from 'react'
import { useRequest, useTitle } from 'ahooks'
import { Typography, Empty, Table, Tag, Button, Space, Modal, Spin, message } from 'antd'
import styles from './common.module.scss'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import ListSearch from '../../components/ListSearch'
import useLoadQuestionListData from '../../hooks/useLoadQuestionListData'
import ListPage from '../../components/ListPage'
import { updateQuestionService, deleteQuestionsService } from '../../services/question'

const { Title } = Typography
const { confirm } = Modal

export type QuestionType = {
  _id: string
  title: string
  isPublished: boolean
  answerCount: number
  createdAt: string
}

const Trash: FC = () => {
  useTitle('小慕问卷 - 回收站')
  const { data = {}, loading, refresh } = useLoadQuestionListData({ isDeleted: true })

 
  const { list = [], total = 0 } = data

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  
  const { loading: recoverLoading, run: recover } = useRequest(
    async () => {
      for (const id of selectedIds) {
        await updateQuestionService(id, { isDeleted: false })
      }
    },
    {
      manual: true,
      debounceWait: 500,
      onSuccess() {
        message.success('恢复成功')
        refresh()
        setSelectedIds([])
      },
    }
  )

  // 删除
  const { loading: deleteLoading, run: deleteQuestion } = useRequest(
    async () => await deleteQuestionsService(selectedIds),
    {
      manual: true,
      onSuccess() {
        message.success('删除成功')
        refresh()
        setSelectedIds([])
      },
    }
  )

  function del() {
    confirm({
      title: '确认彻底删除该问卷？',
      icon: <ExclamationCircleOutlined />,
      content: '删除以后不可找回',
      onOk: () => deleteQuestion(),
    })
  }

  const tableColumns = [
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '是否发布',
      dataIndex: 'isPublished',
      render: (isPublished: boolean) => {
        return isPublished ? <Tag color="processing">已发布</Tag> : <Tag>未发布</Tag>
      },
    },
    {
      title: '答卷',
      dataIndex: 'answerCount',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
    },
  ]

  const TableElem = (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Button
            disabled={selectedIds.length === 0 || recoverLoading}
            loading={recoverLoading}
            onClick={recover}
          >
            恢复
          </Button>
          <Button
            danger
            disabled={selectedIds.length === 0 || deleteLoading}
            loading={deleteLoading}
            onClick={del}
          >
            彻底删除
          </Button>
        </Space>
      </div>
      <Table
        dataSource={list}
        columns={tableColumns}
        pagination={false}
        rowKey={(q: QuestionType) => q._id}
        rowSelection={{
          type: 'checkbox',
          onChange: selectedRowKeys => {
            setSelectedIds(selectedRowKeys as string[])
          },
        }}
      />
    </>
  )

  return (
    <>
      <div className={styles.header}>
        <div className={styles.left}>
          <Title level={3}>回收站</Title>
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
        {list.length > 0 && TableElem}
      </div>

      <div className={styles.footer}>
        <ListPage total={total} />
      </div>
    </>
  )
}

export default Trash
