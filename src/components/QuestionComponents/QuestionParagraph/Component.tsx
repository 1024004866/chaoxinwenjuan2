import React,{FC} from 'react'
import {QuestionParagraphPropsType,QuestionParagraphDefaultProps} from './interface'
import { Typography } from 'antd'
const {Paragraph} = Typography
const Component:FC<QuestionParagraphPropsType> = (props: QuestionParagraphPropsType) => {
    const {text='',isCenter=false} = {...QuestionParagraphDefaultProps,...props}
    const t= text.replace('<br/>','\n')
    const textList = t.split('\n')  
    return (
  <Paragraph
    style={{
      textAlign: isCenter ? 'center' : 'start',
      marginBottom: '16px'
    }}
  >
    {textList.map((t, index) => (
      <span key={index}>
        {index > 0 && <br />}
        {t}
      </span>
    ))}
  </Paragraph>
)
}
export default Component