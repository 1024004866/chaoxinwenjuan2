import { FC } from 'react'
import QuestionInputConf, { QuestionInputPropsType } from './QuestionInput/index'
import QuestionTitleConf, { QuestionTitlePropsType } from './QuestionTitle'
import QuestionParagraphConf, { QuestionParagraphPropsType } from './QuestionParagraph'
import QuestionInfoConf, { QuestionInfoPropsType } from './QuestionInfo'
import QuestionTextareaConf, { QuestionTextareaPropsType } from './QuestionTextarea'
import { QuestionRadioPropsType,QuestionRadioStatPropsType } from './QuestionRadio'
import QuestionRadioConf from './QuestionRadio'
import QuestionCheckboxConf from './QuestionCheckbox'
import { QuestionCheckboxPropsType } from './QuestionCheckbox'
// 各个组件的 prop type
export type ComponentPropsType =
  Partial<
    Omit<QuestionInputPropsType, 'onChange'> &
      Omit<QuestionTitlePropsType, 'onChange'> &
      Omit<QuestionParagraphPropsType, 'onChange'> &
      Omit<QuestionInfoPropsType, 'onChange'> &
      Omit<QuestionTextareaPropsType, 'onChange'> &
      Omit<QuestionRadioPropsType, 'onChange'> &
      Omit<QuestionCheckboxPropsType, 'onChange'>
  > & {
    onChange?: (...args: any[]) => void
  }
//统一各个组建的统计组件类型
type ComponentStatPropsType = QuestionRadioStatPropsType

// 统一，组件的配置
export type ComponentConfType = {
  title: string
  type: string
  Component: FC<ComponentPropsType>
  PropComponent: FC<ComponentPropsType>
  defaultProps: ComponentPropsType
  StatComponent?:FC<ComponentStatPropsType>
}

// 全部组件配置的列表
const ComponentConfList: ComponentConfType[] = [
  QuestionInputConf,
  QuestionTitleConf,
  QuestionParagraphConf,
  QuestionInfoConf,
  QuestionTextareaConf,
  QuestionRadioConf,
  QuestionCheckboxConf,
]

export function getComponentConfByType(type: string) {
  return ComponentConfList.find((c) => c.type === type)
}

// 组件分组
export const componentConfGroup = [
  {
    groupId: 'textGroup',
    groupName: '文本显示',
    components: [QuestionTitleConf, QuestionParagraphConf, QuestionInfoConf],
  },
  {
    groupId: 'inputGroup',
    groupName: '用户输入',
    components: [QuestionInputConf, QuestionTextareaConf],
  },
  {
    groupId: 'chooseGroup',
    groupName: '用户选择',
    components: [QuestionRadioConf, QuestionCheckboxConf],
  }
]
