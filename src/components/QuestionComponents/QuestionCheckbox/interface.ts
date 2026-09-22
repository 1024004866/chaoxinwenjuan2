export type OptionsType = {
  text: string
  value: string
  checked?: boolean
}

export type QuestionCheckboxPropsType = {
  title?: string
  isVertical?: boolean
  list?: OptionsType[]
  onChange?: (newProps: QuestionCheckboxPropsType) => void
  disabled?: boolean
}

export const QuestionCheckboxDefaultProps: QuestionCheckboxPropsType = {
  title: '多选标题',
  isVertical: false,
  list: [
    { text: '选项1', value: 'option1', checked: false },
    { text: '选项2', value: 'option2', checked: false },
    { text: '选项3', value: 'option3', checked: false },
  ],
  onChange: () => {},
  disabled: false,
}

// 统计组件的属性类型
export type QuestionCheckboxStatPropsType = {
  stat: Array<{
    name: string
    count: number
  }>
}
