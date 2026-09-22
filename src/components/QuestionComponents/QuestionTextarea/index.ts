import Component from './Component'
import { QuestionTextareaDefaultProps } from './interface'
import PropComponent from './PropComponent'

export * from './interface'

const QuestionTextareaConf = {
  title: '多行输入',
  type: 'questionTextarea',
  Component,
  PropComponent,
  defaultProps: QuestionTextareaDefaultProps,
}
export default QuestionTextareaConf
