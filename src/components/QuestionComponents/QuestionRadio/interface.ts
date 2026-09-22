export type QuestionRadioPropsType = {
  title?: string
  isVertical?: boolean
  options?: OptionsType[]
  value?: string
  onChange?: (newProps: QuestionRadioPropsType) => void
  disabled?: boolean
}

export type OptionsType = {
  text: string
  value: string
}

export const QuestionRadioDefaultProps: QuestionRadioPropsType = {
  title: '单选标题',
  isVertical: false,
  options: [
    { text: '选项1', value: 'option1' },
    { text: '选项2', value: 'option2' },
    { text: '选项3', value: 'option3' },
  ],
  value: '',
  onChange: () => {},
  disabled: false,
}
//统计组件的属性类型
export type QuestionRadioStatPropsType = {
  stat: Array<{
    name: string
    count: number
  }>  
}
//

