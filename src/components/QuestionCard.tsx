import {
  EditOutlined,
  LineChartOutlined,
  StarOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { updateQuestionService, duplicateQuestionService } from '../services/question'
import { Button, Space, Divider, Tag, Popconfirm, Modal, message } from 'antd'
import { useNavigate, Link } from 'react-router-dom'
import React, { FC, useState } from 'react'
import styles from './QuestionCard.module.scss'
import { useRequest } from 'ahooks'

const { confirm } = Modal

type PropsType = {
  _id: string
  title: string
  isStar: boolean
  isPublished: boolean
  answerCount: number
  createdAt?: string
  createAt?: string
}

const QuestionCard: FC<PropsType> = (props: PropsType) => {
  const { _id, title, createdAt, createAt, isStar, answerCount, isPublished } = props
  const createTime = createdAt || createAt
  const [isStarState, setIsStarState] = useState(isStar)
  const [isDeletedState, setIsDeletedState] = useState(false)
  const nav = useNavigate()

  const { loading: changeStarLoading, run: changeStar } = useRequest(
    async () => {
      await updateQuestionService(_id, { isStar: !isStarState })
    },
    {
      manual: true,
      onSuccess() {
        setIsStarState(!isStarState)
        message.success('已更新')
      },
    }
  )

  const { loading: duplicateLoading, run: duplicate } = useRequest(
    async () => {
      const data = await duplicateQuestionService(_id)
      return data
    },
    {
      manual: true,
      onSuccess(result) {
        message.success('复制成功')
        nav(`/question/edit/${result.id}`)
      },
    }
  )

  const { loading: deleteLoading, run: deleteQuestion } = useRequest(
    async () => {
      return await updateQuestionService(_id, { isDeleted: true })
    },
    {
      manual: true,
      onSuccess() {
        message.success('删除成功')
        setIsDeletedState(true)
      },
    }
  )

  function del() {
    confirm({
      title: '确认删除该问卷？',
      icon: <ExclamationCircleOutlined />,
      onOk: () => deleteQuestion(),
    })
  }

  if (isDeletedState) return null

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <div className={styles.left}>
          <Space>{isStarState && <StarOutlined style={{ color: 'red' }} />}</Space>
          <Link to={isPublished ? `/question/stat/${_id}` : `/question/edit/${_id}`}>{title}</Link>
        </div>
        <div className={styles.right}>
          <Space>
            {isPublished ? <Tag color="processing">已发布</Tag> : <Tag>未发布</Tag>}
            <span>答卷: {answerCount}</span>
            <span>{createTime}</span>
          </Space>
        </div>
      </div>
      <Divider style={{ margin: '12px 0' }} />
      <div className={styles['button-container']}>
        <div className={styles.left}>
          <Space>
            <Button
              icon={<EditOutlined />}
              type="text"
              size="small"
              onClick={() => nav(`/question/edit/${_id}`)}
            >
              编辑问卷
            </Button>
            <Button
              icon={<LineChartOutlined />}
              type="text"
              size="small"
              onClick={() => nav(`/question/stat/${_id}`)}
              disabled={!isPublished}
            >
              问卷统计
            </Button>
          </Space>
        </div>
        <div className={styles.right}>
          <Space>
            <Button
              type="text"
              icon={<StarOutlined />}
              size="small"
              onClick={changeStar}
              disabled={changeStarLoading}
            >
              {isStarState ? '取消星标' : '星标'}
            </Button>
            <Popconfirm
              title="确定复制该问卷？"
              okText="确定"
              cancelText="取消"
              onConfirm={duplicate}
            >
              <Button type="text" icon={<CopyOutlined />} size="small" disabled={duplicateLoading}>
                复制
              </Button>
            </Popconfirm>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              onClick={del}
              disabled={deleteLoading}
            >
              删除
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
