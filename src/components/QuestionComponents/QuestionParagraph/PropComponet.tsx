import React, { FC, useEffect } from 'react'
import { QuestionParagraphPropsType } from './interface'
import { Checkbox, Form, Input } from 'antd'

const { TextArea } = Input

const Component: FC<QuestionParagraphPropsType> = (props: QuestionParagraphPropsType) => {
  const { text, isCenter, onChange, disabled } = props
  const [form] = Form.useForm()

  // 同步外部 props → 表单
  useEffect(() => {
    form.setFieldsValue({ text, isCenter })
  }, [text, isCenter, form])

  // 表单值变化
  function handleValueChange() {
    if (onChange) {
      onChange(form.getFieldsValue())
    }
  }

  return (
    <Form
      layout="vertical"
      initialValues={{ text, isCenter }}
      disabled={disabled}
      onValuesChange={handleValueChange}
      form={form}
    >
      <Form.Item
        label="段落内容"
        name="text"
        rules={[{ required: true, message: '请输入段落内容' }]}
      >
        <TextArea />
      </Form.Item>

      <Form.Item label="是否居中" name="isCenter" valuePropName="checked">
        <Checkbox>居中显示</Checkbox>
      </Form.Item>
    </Form>
  )
}

export default Component