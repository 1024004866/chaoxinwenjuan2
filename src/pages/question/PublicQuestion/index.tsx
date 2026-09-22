import React, { FC, useState } from 'react'
import { Button, Checkbox, Form, Input, Radio, Result, Spin, Typography } from 'antd'
import { useRequest, useTitle } from 'ahooks'
import { useNavigate, useParams } from 'react-router-dom'
import { getQuestionService, submitQuestionAnswerService } from '../../../services/question'
import { ComponentInfoType } from '../../../store/componentsReducer'
import { getComponentConfByType } from '../../../components/QuestionComponents'
import styles from './index.module.scss'

const { Title, Paragraph } = Typography
const { TextArea } = Input

function renderQuestion(component: ComponentInfoType) {
  const { fe_id, type, props = {} } = component
  const title = String(props.title || component.title)
  if (type === 'questionInput') return <Form.Item name={fe_id} label={title} rules={[{ required: true, message: '请填写此项' }]}><Input placeholder={props.placeholder as string} /></Form.Item>
  if (type === 'questionTextarea') return <Form.Item name={fe_id} label={title} rules={[{ required: true, message: '请填写此项' }]}><TextArea rows={4} placeholder={props.placeholder as string} /></Form.Item>
  if (type === 'questionRadio') return <Form.Item name={fe_id} label={title} rules={[{ required: true, message: '请选择一项' }]}><Radio.Group options={(props.options as Array<{ text: string; value: string }> || []).map(item => ({ label: item.text, value: item.value }))} /></Form.Item>
  if (type === 'questionCheckbox') return <Form.Item name={fe_id} label={title} rules={[{ required: true, message: '请至少选择一项' }]}><Checkbox.Group options={(props.list as Array<{ text: string; value: string }> || []).map(item => ({ label: item.text, value: item.value }))} /></Form.Item>
  const conf = getComponentConfByType(type)
  return conf ? <div className={styles.display}><conf.Component {...props} /></div> : null
}

const PublicQuestion: FC = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const { data, loading, error } = useRequest(() => getQuestionService(id), { refreshDeps: [id] })
  const { loading: submitting, run: submit } = useRequest(
    (values: Record<string, string | string[]>) => submitQuestionAnswerService(id, values),
    { manual: true, onSuccess: () => setSubmitted(true) }
  )
  useTitle(data?.title ? `${data.title} - 小慕问卷` : '填写问卷')

  if (loading) return <div className={styles.center}><Spin size="large" /></div>
  if (error || !data) return <div className={styles.center}><Result status="404" title="问卷不存在" subTitle="问卷可能尚未发布或已被删除" extra={<Button onClick={() => navigate('/')}>返回首页</Button>} /></div>
  if (submitted) return <div className={styles.center}><Result status="success" title="提交成功" subTitle="感谢你的认真填写" extra={<Button type="primary" onClick={() => navigate('/')}>返回首页</Button>} /></div>

  const components = (data.componentList || []).filter((item: ComponentInfoType) => !item.isHidden)
  return (
    <main className={styles.page}>
      <section className={styles.sheet}>
        <header className={styles.header}>
          <Title level={2}>{data.title}</Title>
          {data.desc && <Paragraph type="secondary">{data.desc}</Paragraph>}
        </header>
        <Form layout="vertical" requiredMark="optional" onFinish={submit}>
          {components.map((component: ComponentInfoType) => <React.Fragment key={component.fe_id}>{renderQuestion(component)}</React.Fragment>)}
          <Button className={styles.submit} type="primary" size="large" htmlType="submit" loading={submitting}>提交答卷</Button>
        </Form>
      </section>
    </main>
  )
}

export default PublicQuestion
