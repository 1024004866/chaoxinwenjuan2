import Component from './Component'
import PropComponent from './PropComponent'
import { QuestionCheckboxDefaultProps } from './interface'
import StatComponent from './StatComponent'

export * from './interface'

const QuestionCheckboxConf = {
  title: '多选',
  type: 'questionCheckbox',
  Component,
  PropComponent,
  defaultProps: QuestionCheckboxDefaultProps,
  StatComponent,
}
export default QuestionCheckboxConf
