import { useSelector } from 'react-redux'
import { StateType } from '../store'
import { ComponentsStateType } from '../store/componentsReducer'

function useGetComponentInfo() {
  // 完整获取 Redux 中的 components 状态
  const components = useSelector<StateType>(state => state.components.present) as ComponentsStateType

  // 从 components 中解构出 componentList，并设置默认值为空数组
  const { componentList = [], selectedId,copiedComponent } = components
  const selectedComponent = componentList.find(c=>c.fe_id===selectedId)
  return {
    componentList,
    selectedId,
    selectedComponent,
    copiedComponent

  }
}

export default useGetComponentInfo
