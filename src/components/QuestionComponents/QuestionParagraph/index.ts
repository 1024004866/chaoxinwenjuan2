import Componet from './Component'
import {QuestionParagraphDefaultProps} from './interface'
import PropComponet from './PropComponet'
export * from './interface'
const QuestionParagraphConf = {
    title:'段落',
    type:'questionParagraph',
    Component:Componet, 
    PropComponent:PropComponet,
    defaultProps:QuestionParagraphDefaultProps

}
export default QuestionParagraphConf
