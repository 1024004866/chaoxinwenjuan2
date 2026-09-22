import React, { FC, useEffect } from 'react'
import { Button, Checkbox, Form, Input, Select, Space } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { OptionsType, QuestionRadioDefaultProps, QuestionRadioPropsType } from './interface'

const PropComponent: FC<QuestionRadioPropsType> = (props: QuestionRadioPropsType) => {
  const defaultOptions = QuestionRadioDefaultProps.options || []
  const normalizedOptions =
    props.options && props.options.length > 0
      ? props.options.map((opt, index) => ({
          text: opt.text || `选项${index + 1}`,
          value: opt.value || `option${index + 1}`,
        }))
      : defaultOptions
  const title = props.title ?? QuestionRadioDefaultProps.title
  const isVertical = props.isVertical ?? QuestionRadioDefaultProps.isVertical
  const options = normalizedOptions
  const value = props.value ?? QuestionRadioDefaultProps.value
  const { onChange, disabled } = props
  const [form] = Form.useForm()
  const currentOptions = (Form.useWatch('options', form) || options) as OptionsType[]

  useEffect(() => {
    form.setFieldsValue({ title, isVertical, value, options })
    if (onChange && props.options?.some((opt, index) => !opt.text || !opt.value)) {
      onChange({ title, isVertical, value, options })
    }
  }, [title, isVertical, value, options, form, onChange, props.options])

  function handleValuesChange() {
    if (onChange == null) return

    const newValues = form.getFieldsValue() as QuestionRadioPropsType
    const cleanOptions = (newValues.options || []).filter((opt) => opt && opt.text != null)
    newValues.options = cleanOptions.map((opt, index) => ({
      text: opt.text || `选项${index + 1}`,
      value: opt.value || `option${index + 1}`,
    }))

    if (newValues.value && !newValues.options.some((opt) => opt.value === newValues.value)) {
      newValues.value = ''
    }

    onChange(newValues)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ title, isVertical, value, options }}
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
        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }, index) => (
                <Space key={key} align="baseline" style={{ width: '100%' }}>
                  <Form.Item
                    name={[name, 'text']}
                    rules={[
                      { required: true, message: '请输入选项文字' },
                      {
                        validator: (_, text) => {
                          const formValues = form.getFieldsValue() as QuestionRadioPropsType
                          const sameTextCount = (formValues.options || []).filter(
                            (opt) => opt.text === text
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
                  onClick={() => add({ text: '', value: `option${fields.length + 1}` })}
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

      <Form.Item label={'默认选中'} name="value">
        <Select
          allowClear
          options={currentOptions
            .filter((opt) => opt.text)
            .map((opt: OptionsType) => ({
              label: opt.text,
              value: opt.value,
            }))}
        />
      </Form.Item>

      <Form.Item name="isVertical" valuePropName="checked">
        <Checkbox>{'竖向排列'}</Checkbox>
      </Form.Item>
    </Form>
  )
}

export default PropComponent
