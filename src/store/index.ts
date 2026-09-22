import { configureStore } from '@reduxjs/toolkit'
import userReducer, { UserStateType } from './userReducer'
import componentsReducer, { ComponentsStateType } from './componentsReducer'
import pageInfoReducer, { PageInfoType } from './pageInfoReducer'
import undoable, { excludeAction, StateWithHistory } from 'redux-undo'
export type StateType = {
  user: UserStateType
  components: StateWithHistory<ComponentsStateType>
  pageInfo: PageInfoType
}
export default configureStore({
  reducer: {
    user: userReducer,
    //组件列表（复杂，undo/redo)
    // components: componentsReducer,
    //增加了undo
    // 增加了 undo
components: undoable(componentsReducer, {
  limit: 20, // 限制 undo 20 步
  filter: excludeAction([
    'components/resetComponents',
    'components/changeSelectedId',
    'components/selectPrevComponent',
    'components/selectNextComponent',
  ])
}),
    

    //页面信息
    pageInfo: pageInfoReducer,
  },
})
