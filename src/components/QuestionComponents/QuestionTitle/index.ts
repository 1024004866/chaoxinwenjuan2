import Component from './Component'
import { QuestionTitleDefaultProps } from './interface'
import PropComponent from './PropComponent'
export * from './interface'
//Title组件的配置
const QuestionTitleConf = {
  title: '标题',
  type: 'questionTitle', // 要和后端统一好
  Component,
  PropComponent,
  defaultProps: QuestionTitleDefaultProps,
}
export default QuestionTitleConf
