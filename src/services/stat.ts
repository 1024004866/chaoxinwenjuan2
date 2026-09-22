import axios,{ResDataType} from "./ajax";
//获取问卷统计列表
export async function getQuestionStatListService(questionId: string,opt:{page:number;pageSize:number}):Promise<ResDataType> {
    const url=`/api/stat/${questionId}`
    const data=(await axios.get(url,{params:opt})) as ResDataType
    return data
}
//获取组件统计数据汇总
export async function getComponentStateService(questionId: string, componentId: string):Promise<ResDataType> {
    const url=`/api/stat/component/${questionId}/${componentId}`
    const data=(await axios.get(url)) as ResDataType
    return data
}
