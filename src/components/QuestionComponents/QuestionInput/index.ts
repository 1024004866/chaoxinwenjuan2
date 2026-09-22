import Component from './Component'
import { QuestionInputDefaultProps } from './interface'
import PropComponent from './PropComponent'
export * from './interface'
//Input组件的配置
const QuestionInputConf = {
  title: '输入框',
  type: 'questionInput', // 要和后端统一好
  Component,//画布显示
  PropComponent,//修改属性
  defaultProps: QuestionInputDefaultProps,
}
export default QuestionInputConf
