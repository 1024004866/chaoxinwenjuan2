import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ComponentPropsType } from '../../components/QuestionComponents'
import { getNextSelectedId,insertNewComponent } from './utils'
import cloneDeep from 'lodash/cloneDeep'
import {arrayMove} from '@dnd-kit/sortable'
import { nanoid } from '@reduxjs/toolkit'
// 单个组件
export type ComponentInfoType = {
  fe_id: string
  type: string
  title: string
  isHidden?: boolean
  isLocked?: boolean
  props: ComponentPropsType
}

export type ComponentsStateType = {
  selectedId: string
  componentList: ComponentInfoType[]
  copiedComponent: ComponentInfoType | null
}

const INIT_STATE: ComponentsStateType = {
  componentList: [],
  selectedId: '',
  copiedComponent: null,
}

export const componentsSlice = createSlice({
  name: 'components',
  initialState: INIT_STATE,

  reducers: {
    // 重置所有组件
    resetComponents: (state, action: PayloadAction<ComponentsStateType>) => {
      return action.payload
    },

    // 修改 selectedId
    changeSelectedId: (state: ComponentsStateType, action: PayloadAction<string>) => {
      state.selectedId = action.payload
    },

    // 添加新组件
    addComponent: (state: ComponentsStateType, action: PayloadAction<ComponentInfoType>) => {
      const newComponent = action.payload
      insertNewComponent(state, newComponent)
    },
     

    // 修改组件属性
    changeComponentProps: (
      state: ComponentsStateType,
      action: PayloadAction<{ fe_id: string; newProps: ComponentPropsType }>
    ) => {
      const { fe_id, newProps } = action.payload
      const curComp = state.componentList.find(c => c.fe_id === fe_id)
      
      if (curComp) {
        curComp.props = {
          ...curComp.props,
          ...newProps,
        }
      }
    },

    // 删除选中的组件
    removeSelectedComponent: (draft: ComponentsStateType) => {
      const { selectedId: removeId, componentList } = draft
      if (!removeId) return // 没有选中组件，直接返回 
      // 重新计算 selectedId
      const newSelectedId = getNextSelectedId(removeId, componentList)
      draft.selectedId = newSelectedId
      
      const index = componentList.findIndex(c => c.fe_id === removeId)
      componentList.splice(index, 1)
    },



    //隐藏/显示组件
    changeComponentHidden: (draft: ComponentsStateType, action: PayloadAction<{ fe_id: string ,isHidden: boolean }>) => {
      const {fe_id ,isHidden} = action.payload
      const {componentList=[]} = draft
      //重新计算 selectedId
      let newSelectedId = ''
      if(isHidden){
        //如果是隐藏组件，且当前选中组件就是它，则需要重新计算 selectedId
        newSelectedId = getNextSelectedId(fe_id, componentList)
      }
      else{
        //如果是显示组件，则直接选中它
        newSelectedId = fe_id
      }
      
      draft.selectedId = newSelectedId
      const curComp = componentList.find(c => c.fe_id === fe_id)
      if(curComp) {
        curComp.isHidden = isHidden
       }
    },
    //锁定/解锁组件
   toggleComponentLocked: (draft: ComponentsStateType, action: PayloadAction<{ fe_id: string  }>) => {
      const {fe_id} = action.payload
      const {componentList=[]} = draft
      const curComp = componentList.find(c => c.fe_id === fe_id)
      if(curComp) {
        curComp.isLocked = !curComp.isLocked
       }
      },
//拷贝当前选中的组件
      copySelectedComponent: (draft: ComponentsStateType) => {
        const {selectedId, componentList=[]} = draft
        const selectedCompnent = componentList.find(c => c.fe_id === selectedId)
        if(selectedCompnent){
          draft.copiedComponent = cloneDeep(selectedCompnent)//深拷贝
        } else {      
          draft.copiedComponent = null
        }
      },
//粘贴组件
      pasteCopiedComponent: (draft: ComponentsStateType) => {
        const {copiedComponent} = draft   
        if(copiedComponent==null) return
        //要把fe_id改掉，不能和原来组件重复，不然跟原来的复制的id一样了
        copiedComponent.fe_id = nanoid() //生成新的 fe_id
        insertNewComponent(draft, copiedComponent) //插入新组件
    
  },
  //选中上一个
  selectPrevComponent: (draft: ComponentsStateType) => {
    const {selectedId, componentList=[]} = draft
    const visibleComponents = componentList.filter(c => !c.isHidden)
    const index = visibleComponents.findIndex(c => c.fe_id === selectedId)    
    if(index>0){
      draft.selectedId = visibleComponents[index-1].fe_id
    }
},
//选中下一个
selectNextComponent: (draft: ComponentsStateType) => {
  const {selectedId, componentList=[]} = draft
  const visibleComponents = componentList.filter(c => !c.isHidden)
  const index = visibleComponents.findIndex(c => c.fe_id === selectedId)    
  if(index>=0 && index<visibleComponents.length-1){
    draft.selectedId = visibleComponents[index+1].fe_id   
  }
  },
  //修改组件标题
  changeComponentTitle: (draft: ComponentsStateType, action: PayloadAction<{ fe_id: string; newTitle: string }>) => {
    const { fe_id, newTitle } = action.payload
    const { componentList } = draft
    const curComp = componentList.find(c => c.fe_id === fe_id)
    if (curComp) {
      curComp.title = newTitle
    }
  },
  //移动组件位置
  moveComponent: (draft: ComponentsStateType, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
    const { oldIndex, newIndex } = action.payload
    const { componentList:curComponentList } = draft
    draft.componentList = arrayMove(curComponentList, oldIndex, newIndex)
  },

  }

})

export const {
  resetComponents,
  changeSelectedId,
  addComponent,
  changeComponentProps,
  removeSelectedComponent,
  changeComponentHidden,
  toggleComponentLocked,
  copySelectedComponent,
  pasteCopiedComponent,
  selectPrevComponent,
  selectNextComponent,
  changeComponentTitle,
  moveComponent
} = componentsSlice.actions

export default componentsSlice.reducer
