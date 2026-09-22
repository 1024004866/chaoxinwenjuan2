import { Spin } from 'antd'
import React, { FC, MouseEvent } from 'react'
import useGetComponentInfo from '../../../hooks/useGetComponentInfo'
import { changeSelectedId, ComponentInfoType,moveComponent } from '../../../store/componentsReducer'
import styles from './EditCanvas.module.scss'
import { getComponentConfByType } from '../../../components/QuestionComponents'
import { useDispatch } from 'react-redux'
import classNames from 'classnames'

import useBindCanvasKeyPress from '../../../hooks/useBindCanvasKeyPress'
import SortableContainer from '../../../components/DragSortable/SortableContainer'
import SortableItem from '../../../components/DragSortable/SortableItem'
type PropsType = {
  loading: boolean
}

function getComponentId(componentInfo: ComponentInfoType, index: number) {
  const { fe_id } = componentInfo
  const { _id, id } = componentInfo as ComponentInfoType & { _id?: string; id?: string }
  return fe_id || _id || id || `component-${index}`
}

function genComponent(componentInfo: ComponentInfoType) {
  const { type, props } = componentInfo
  const componentConf = getComponentConfByType(type)
  if (componentConf == null) return null
  const { Component } = componentConf
  return <Component {...props} />
}

const EditCanvas: FC<PropsType> = ({ loading }) => {
  const { componentList, selectedId } = useGetComponentInfo()
  const dispatch = useDispatch()
  //点击组件，选中
  function handleClick(event: MouseEvent<HTMLDivElement>, id: string) {
    event.stopPropagation()
    dispatch(changeSelectedId(id))
  }
  const visibleComponentList = componentList.filter(c => !c.isHidden)
  const componentsWithId = visibleComponentList.map(c => ({
    ...c,
    id: c.fe_id,
  }))

  function handleDragEnd(oldIndex: number, newIndex: number) {
    const oldComponent = visibleComponentList[oldIndex]
    const newComponent = visibleComponentList[newIndex]
    if (oldComponent == null || newComponent == null) return

    const oldComponentIndex = componentList.findIndex(c => c.fe_id === oldComponent.fe_id)
    const newComponentIndex = componentList.findIndex(c => c.fe_id === newComponent.fe_id)
    dispatch(moveComponent({ oldIndex: oldComponentIndex, newIndex: newComponentIndex }))
  }
  //绑定快捷键
  useBindCanvasKeyPress()
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Spin />
      </div>
    )
  }

  return (
    <div className={styles.canvas}>
      <SortableContainer items={componentsWithId} onDragEnd={handleDragEnd}>
      {visibleComponentList.map((c, index) => {
        const componentId = getComponentId(c, index)
        const lockedClassName = styles.locked
        const wrapperClassName = classNames({
          [styles['component-wrapper']]: true,
          [styles.selected]: componentId === selectedId,
          [lockedClassName]: c.isLocked
        })

        return (
          <SortableItem key={componentId} id={componentId}>
          <div
            className={wrapperClassName}
            onClick={event => handleClick(event, componentId)}
          >
            <div className={styles.component}>{genComponent(c)}</div>
          </div>
          </SortableItem>
        )
      })}
      </SortableContainer>
    </div>
  )
}

export default EditCanvas
