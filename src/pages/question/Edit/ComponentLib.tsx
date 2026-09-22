import React, { FC } from 'react'
import { Typography } from 'antd'
import { componentConfGroup, ComponentConfType } from '../../../components/QuestionComponents'
import { useDispatch } from 'react-redux'
import { addComponent } from '../../../store/componentsReducer'
import styles from './ComponentLib.module.scss'
import { nanoid } from '@reduxjs/toolkit'
import cloneDeep from 'lodash/cloneDeep'
const { Title } = Typography
function genComponent(c: ComponentConfType, dispatch: ReturnType<typeof useDispatch>) {
  const { title, type, Component, defaultProps } = c
  function handleClick() {
    dispatch(
      addComponent({
        fe_id: nanoid(),
        title,
        type,
        props: cloneDeep(defaultProps),
      })
    )
  }
  return (
    <div key={type} className={styles.wrapper} onClick={handleClick}>
      <div className={styles.component}>
        <Component />
      </div>
    </div>
  )
}
const Lib: FC = () => {
  const dispatch = useDispatch()
  return (
    <>
      {componentConfGroup.map((group, index) => {
        const { groupId, groupName, components } = group
        return (
          <div key={groupId}>
            <Title
              level={3}
              style={{
                fontSize: '16px',
                marginTop: index > 0 ? '20px' : '0px',
              }}
            >
              {groupName}
            </Title>
            <div>{components.map(c => genComponent(c, dispatch))}</div>
          </div>
        )
      })}
    </>
  )
}

export default Lib
