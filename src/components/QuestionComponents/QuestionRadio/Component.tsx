import React, { FC } from 'react'
import { Typography, Radio, Space } from 'antd'
import { QuestionRadioPropsType, QuestionRadioDefaultProps } from './interface'

const { Paragraph } = Typography

const Component: FC<QuestionRadioPropsType> = (props: QuestionRadioPropsType) => {
  const { title, isVertical, options = [], value } = { ...QuestionRadioDefaultProps, ...props }
  const displayOptions =
    options.length > 0 ? options : QuestionRadioDefaultProps.options || []

  return (
    <div>
      <Paragraph strong>{title}</Paragraph>
      <Radio.Group value={value}>
        <Space direction={isVertical ? 'vertical' : 'horizontal'}>
          {displayOptions.map((option, index) => {
            const optionValue = option.value || `option${index + 1}`
            const optionText = option.text || `选项${index + 1}`
            return (
              <Radio key={optionValue} value={optionValue}>
                {optionText}
              </Radio>
            )
          })}
        </Space>
      </Radio.Group>
    </div>
  )
}

Component.defaultProps = QuestionRadioDefaultProps
export default Component

