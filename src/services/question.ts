import axios, { ResDataType } from './ajax'
// import type { ResDataType } from './ajax'
type SearchOption = {
  keyword: string
  isStar: boolean
  isDeleted: boolean
  page: number
  pageSize: number
}
//这个文件的作用就是返回经过后端返回的问卷数据（被拦截器处理过，已经剥掉了外层的 errno 等字段）

//获取单个问卷信息
export async function getQuestionService(id: string): Promise<ResDataType> {
  const url = `/api/question/${id}`
  const data = (await axios.get(url)) as ResDataType
  return data
}
//创建单个问卷信息
export async function createQuestionService(): Promise<ResDataType> {
  const url = `/api/question`
  const data = (await axios.post(url)) as ResDataType
  return data
}
//获取（查询）问卷列表
export async function getQuestionListService(
  opt: Partial<SearchOption> = {}
): Promise<ResDataType> {
  const url = '/api/question'
  const data = (await axios.get(url, { params: opt })) as ResDataType
  return data
}
//更新单个问卷
export async function updateQuestionService(id: string, opt: { [key: string]: any }) {
  const url = `/api/question/${id}`
  const data = (await axios.patch(url, opt)) as ResDataType
  return data
}
// 复制问卷
export async function duplicateQuestionService(id: string): Promise<ResDataType> {
  const url = `/api/question/duplicate/${id}`
  const data = (await axios.post(url)) as ResDataType
  return data
}
// 批量彻底删除
export async function deleteQuestionsService(ids: string[]): Promise<ResDataType> {
  const url = '/api/question'
  const data = (await axios.delete(url, { data: { ids } })) as ResDataType
  return data
}

export async function submitQuestionAnswerService(
  id: string,
  answers: Record<string, string | string[]>
): Promise<ResDataType> {
  const data = (await axios.post(`/api/answer/${id}`, { answers })) as ResDataType
  return data
}
