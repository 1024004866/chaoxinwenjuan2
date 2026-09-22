import React, { FC, useEffect, useState } from 'react'
import { Typography } from 'antd'
import {useParams} from 'react-router-dom'
import { useRequest } from 'ahooks'
import { getComponentConfByType } from '../../../components/QuestionComponents'
import {getComponentStateService} from '../../../services/stat'
const { Title } = Typography
type PropsType = {
    selectedComponentId: string
    selectedComponentType: string    
}
const ChartStat: FC<PropsType> = (props: PropsType) => {
    const {selectedComponentId,selectedComponentType} = props
    const {id=''} = useParams()
    const [state, setState] = useState([])
    const {loading, run} = useRequest(async (questionId: string, componentId: string) => {
        const res = await getComponentStateService(questionId, componentId)
        return res
    },{
        manual: true,
        onSuccess: (res) => {
            setState(res.stat)}

    })
    useEffect(() => {
        if(selectedComponentId) {
            run(id, selectedComponentId)
        }
    }, [id,selectedComponentId,run])
    //生成统计图标
function genStateElem() {
    if(!selectedComponentId) {
        return <div>未选中组件</div>
    }
    const {StatComponent}=getComponentConfByType(selectedComponentType)||{}
    if (StatComponent==null) return <div>该组件无统计图表</div>
    if(loading) {
        return <div>加载中...</div>
    }
    return <StatComponent stat={state} />
}

  return <>
    <Title level={3}>图表统计</Title>
    <div>
        {genStateElem()}
    </div>
  </>
}

export default ChartStat
