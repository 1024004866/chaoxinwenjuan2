export type QuestionTextareaPropsType = {
  title?: string
  placeholder?: string
  onChange?: (newProps: QuestionTextareaPropsType) => void
  disabled?: boolean
}

export const QuestionTextareaDefaultProps: QuestionTextareaPropsType = {
  title: '多行输入标题',
  placeholder: '请输入...',
}
