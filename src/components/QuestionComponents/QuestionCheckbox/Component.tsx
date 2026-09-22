import React ,{FC} from 'react'
import {Checkbox, Space, Typography} from 'antd'
import {QuestionCheckboxPropsType,QuestionCheckboxDefaultProps} from './interface'
const {Paragraph}=Typography
const Component:FC<QuestionCheckboxPropsType>=(props:QuestionCheckboxPropsType)=>{
  const {title,isVertical,list=[]}={...QuestionCheckboxDefaultProps,...props}
   return <div>    
      <Paragraph strong>{title}</Paragraph>
      <Space direction={isVertical?'vertical':'horizontal'}>
        {list.map(opt => { // 只改：map 内使用 {} 写逻辑
          const {text,value,checked}=opt
          return <Checkbox key={value} checked={checked}>{text}</Checkbox>
        })}
      </Space>
    </div>
}
export default Component
    