import React, { FC, useState } from 'react'
import {Spin,Result,Button} from 'antd'
import {useTitle} from 'ahooks'
import useLoadQuestionData from '../../../hooks/useLoadQuestionData'
import useGetPageInfo from '../../../hooks/useGetPageInfo'
import { useNavigate } from 'react-router-dom'
import style from './index.module.scss'
import StatHeader from './StatHeader'
import ComponentList from './ComponentList'
import PageStat from './PageStat'
import ChartStat from './ChartStat'
const Stat: FC = () => {
  const { loading, data } = useLoadQuestionData()
  const nav = useNavigate()
  const {title,isPublished} = useGetPageInfo()
  //状态提升selectedId type
  const [selectedComponentId, setSelectedComponentId] = useState('')
  const [selectedComponentType, setSelectedComponentType] = useState('')

  //修改标题
  useTitle(`问卷统计-${title}`)
  const LoadingElem = (
  <div style={{ textAlign: 'center', marginTop: '60px' }}>
    <Spin />
  </div>
)
//Content Elem
  function genContentElem() {

  if(typeof isPublished === 'boolean' && !isPublished) {
    return <div style={{flex:1}}>
       <Result
    status="warning"
    title="该页面尚未发布"
    subTitle="抱歉，您访问的页面不存在"
    extra={<Button type="primary" onClick={() => nav(-1)}>
      返回
    </Button>}
  />
    </div>
  }
  else {
  return <>
   <div className={style['left']}>
            <ComponentList selectedComponentId={selectedComponentId} setSelectedComponentId={setSelectedComponentId} setSelectedComponentType={setSelectedComponentType} />
          </div>
          <div className={style['main']}>
            <PageStat selectedComponentId={selectedComponentId} setSelectedComponentId={setSelectedComponentId} setselectedComponentType={setSelectedComponentType} />
          </div>
          <div className={style['right']}>
            <ChartStat selectedComponentId={selectedComponentId} selectedComponentType={selectedComponentType} />
          </div>
  </>
  }
  }
  return (
    <div className={style.container}>
     
        <StatHeader/>
     
      <div className={style['content-wrapper']}>
         {(loading || !data) && LoadingElem}
<div className={style.content}>
  {!loading && data && genContentElem()}
</div>
      </div>
    </div>
  )
  }

export default Stat
