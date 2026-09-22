import React, { FC, useEffect } from 'react'
import { Button, Checkbox, Form, Input, Space } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { OptionsType, QuestionCheckboxDefaultProps, QuestionCheckboxPropsType } from './interface'

const PropComponent: FC<QuestionCheckboxPropsType> = (props: QuestionCheckboxPropsType) => {
  const mergedProps = { ...QuestionCheckboxDefaultProps, ...props }
  const {
    title,
    isVertical,
    list = QuestionCheckboxDefaultProps.list || [],
    onChange,
    disabled,
  } = mergedProps
  const [form] = Form.useForm()

  useEffect(() => {
    const nextList = list.length > 0 ? list : QuestionCheckboxDefaultProps.list || []
    form.setFieldsValue({ title, isVertical, list: nextList })
  }, [title, isVertical, list, form])

  function handleValuesChange() {
    if (onChange == null) return

    const newValues = form.getFieldsValue() as QuestionCheckboxPropsType
    const cleanList = (newValues.list || []).filter((opt) => opt && opt.text != null)
    newValues.list = cleanList.map((opt, index) => ({
      text: opt.text,
      value: opt.value || `option${index + 1}`,
      checked: !!opt.checked,
    }))

    onChange(newValues)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ title, isVertical, list }}
      disabled={disabled}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label={'标题'}
        name="title"
        rules={[{ required: true, message: '请输入标题' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label={'选项'}>
        <Form.List name="list">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }, index) => (
                <Space key={key} align="baseline" style={{ width: '100%' }}>
                  <Form.Item name={[name, 'checked']} valuePropName="checked">
                    <Checkbox />
                  </Form.Item>
                  <Form.Item
                    name={[name, 'text']}
                    rules={[
                      { required: true, message: '请输入选项文字' },
                      {
                        validator: (_, text) => {
                          const formValues = form.getFieldsValue() as QuestionCheckboxPropsType
                          const sameTextCount = (formValues.list || []).filter(
                            (opt: OptionsType) => opt.text === text
                          ).length
                          if (sameTextCount > 1) {
                            return Promise.reject(
                              new Error('选项文字必须唯一')
                            )
                          }
                          return Promise.resolve()
                        },
                      },
                    ]}
                    style={{ marginBottom: 10, width: '100%' }}
                  >
                    <Input
                      placeholder={'请输入选项文字...'}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  {index > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="link"
                  onClick={() =>
                    add({ text: '', value: `option${fields.length + 1}`, checked: false })
                  }
                  icon={<PlusOutlined />}
                  block
                >
                  {'添加选项'}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item name="isVertical" valuePropName="checked">
        <Checkbox>{'竖向排列'}</Checkbox>
      </Form.Item>
    </Form>
  )
}

export default PropComponent
