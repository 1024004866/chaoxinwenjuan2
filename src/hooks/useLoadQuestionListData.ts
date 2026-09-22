import { useSearchParams } from 'react-router-dom'
import { useRequest } from 'ahooks'
import { getQuestionListService } from '../services/question'
import {
  LIST_SEARCH_PARAM_KEY,
  LIST_PAGE_PARAM_KEY,
  LIST_PAGE_SIZE_PARAM_KEY,
  LIST_PAGE_SIZE,
} from '../constant/index'
import { useMemo } from 'react'

type OptionType = {
  isStar: boolean
  isDeleted: boolean
}

function useLoadQuestionListData(opt: Partial<OptionType> = {}) {
  const { isStar, isDeleted } = opt
  const [searchParams] = useSearchParams()

  // 1. 先把参数拆成稳定的基本类型，避免对象引用变化
  const { keyword, page, pageSize } = useMemo(() => {
    const keyword = searchParams.get(LIST_SEARCH_PARAM_KEY) || ''
    const page = parseInt(searchParams.get(LIST_PAGE_PARAM_KEY) || '') || 1
    const pageSize = parseInt(searchParams.get(LIST_PAGE_SIZE_PARAM_KEY) || '') || LIST_PAGE_SIZE
    return { keyword, page, pageSize }
  }, [searchParams])

  // 2. useRequest 依赖写清楚，只在这些值变了才重请求
  const { data, loading, error, refresh } = useRequest(
    () => getQuestionListService({ keyword, isStar, isDeleted, page, pageSize }),
    {
      refreshDeps: [keyword, page, pageSize, isStar, isDeleted],
    }
  )

  return { data, loading, error, refresh }
}

export default useLoadQuestionListData
