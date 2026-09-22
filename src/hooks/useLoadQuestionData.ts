import { useParams } from 'react-router-dom'
import { getQuestionService } from '../services/question'
import { useRequest } from 'ahooks'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { resetComponents } from '../store/componentsReducer/index'
import { resetPageInfo } from '../store/pageInfoReducer'
//ajax加载
function useLoadQuestionData() {
  const { id = '' } = useParams()
  const dispatch = useDispatch()
  const { data, loading, error, run } = useRequest(
    async (id: string) => {
      if (!id) throw new Error('没有问卷id')
      const data = await getQuestionService(id)
      return data
    },
    {
      manual: true,
    }
  )
  //根据获取的data，设置redux store
  useEffect(() => {
    if (!data) return
    const { title = '', desc = '', js = '', css = '',isPublished = false, componentList = [] } = data
    // 获取默认的 selectedId
    let selectedId = ''
    if (componentList.length > 0) {
      selectedId = componentList[0].fe_id
    }
    //把componentList存储在Redux store中
    dispatch(resetComponents({ componentList, selectedId,copiedComponent:null

     }))
     //把pageInfo存储在Redux store中
      dispatch(resetPageInfo({title, desc, js, css,isPublished}))

  }, [data, dispatch])
  //判断id变化，执行ajax加载问卷
  useEffect(() => {
    if (id) {
      run(id)
    }
  }, [id, run])
  return { loading, error, data }
}

export default useLoadQuestionData
