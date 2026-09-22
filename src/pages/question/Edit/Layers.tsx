import { EyeInvisibleOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons'
import { Button, Input, message, Space } from 'antd'
import classNames from 'classnames'
import SortableContainer from '../../../components/DragSortable/SortableContainer'
import SortableItem from '../../../components/DragSortable/SortableItem'
import React, { ChangeEvent, FC, MouseEvent, useState } from 'react'
import { useDispatch } from 'react-redux'
import useGetComponentInfo from '../../../hooks/useGetComponentInfo'
import { changeComponentHidden, changeSelectedId, moveComponent, toggleComponentLocked } from '../../../store/componentsReducer'
import styles from './Layers.module.scss'
import {changeComponentTitle} from '../../../store/componentsReducer'

const Layers: FC = () => {
  const { componentList, selectedId } = useGetComponentInfo()
  const dispatch = useDispatch()

  // 记录当前正在修改标题的组件
  const [changingTitleId, setChangingTitleId] = useState('')

  function handleTitleClick(fe_id: string) {
    const curComp = componentList.find(c => c.fe_id === fe_id)
    if (curComp && curComp.isHidden) {
      message.info('不能选中隐藏的组件')
      return
    }

    if (fe_id !== selectedId) {
      //当前组件未被选中，执行选中
      dispatch(changeSelectedId(fe_id))
      setChangingTitleId('')
      return
    }
    //点击修改标题
    setChangingTitleId(fe_id)
  }
//修改标题
  function changeTitle(event:ChangeEvent<HTMLInputElement>) {
    const newTitle = event.target.value.trim()
    if (newTitle === '') {
      return  
    }
    if(!selectedId){return}
    dispatch(changeComponentTitle({fe_id:selectedId,newTitle}))
   
  }
//隐藏显示组件
  function handleChangeHidden(event: MouseEvent, fe_id: string, isHidden = false) {
    event.stopPropagation()
    dispatch(changeComponentHidden({ fe_id, isHidden: !isHidden }))
  }
//锁定解锁组件
  function handleChangeLocked(event: MouseEvent, fe_id: string) {
    event.stopPropagation()
    dispatch(toggleComponentLocked({ fe_id }))
  }

  if (componentList.length === 0) {
    return <div className={styles.empty}>暂无图层</div>
  }
//StortableContainer组件的item属性，需要每个item都有id
const componentsWithId = componentList.map(c => ({
  ...c,
  id: c.fe_id,
}))
function handleDragEnd(oldIndex: number, newIndex: number) {
  //拖拽结束后不需要做任何事情，因为组件的顺序已经在SortableContainer组件内部被更新了
  dispatch(moveComponent({ oldIndex, newIndex })  )
}
  return (
    <SortableContainer items={componentsWithId} onDragEnd={handleDragEnd}>
      {componentList.map(c => {
        const { fe_id, title, isHidden, isLocked } = c

        const titleDefaultClassName = styles.title
        const selectedClassName = styles.selected
        const hiddenClassName = styles.hidden
        const titleClassName = classNames({
          [titleDefaultClassName]: true,
          [selectedClassName]: fe_id === selectedId,
          [hiddenClassName]: isHidden,
        })

        return (
          <SortableItem key={fe_id} id={fe_id}>
          <div  className={styles.wrapper}>
            <div className={titleClassName} onClick={() => handleTitleClick(fe_id)}>
              {fe_id === changingTitleId && <Input value={title}  onChange={changeTitle}onPressEnter={() => setChangingTitleId('')} onBlur={() => setChangingTitleId('')} />}
              {fe_id !== changingTitleId && title}
            </div>
            <div className={styles.handler}>
              <Space>
               <Button size="small" shape="circle" className={styles.btn} icon={isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />} type={isHidden ? 'primary' : 'text'} onClick={event => handleChangeHidden(event, fe_id, isHidden)} />
              <Button size="small" shape="circle" className={styles.btn} icon={<LockOutlined />} type={isLocked ? 'primary' : 'text'} onClick={event => handleChangeLocked(event, fe_id)} />
              </Space>
            </div>
          </div>
          </SortableItem>
        )
      })}
    </SortableContainer>
  )
}

export default Layers
