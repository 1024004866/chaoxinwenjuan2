import React,{FC, useState}from 'react'
import {useRequest} from 'ahooks'
import {Typography,Spin,Table, Pagination} from 'antd'
import {useParams} from 'react-router-dom'
import {getQuestionStatListService} from '../../../services/stat'
import useGetComponentInfo from '../../../hooks/useGetComponentInfo'
import{STAT_PAGE_SIZE} from '../../../constant/index'
const {Title} = Typography
type PropsType = {
  selectedComponentId: string
    setSelectedComponentId: (id: string) => void
  setselectedComponentType: (type: string) => void
}
const PageStat: FC<PropsType> = (props: PropsType) => {
    const {selectedComponentId,setSelectedComponentId,setselectedComponentType} = props
    const { id='' } = useParams()
    const [page,setPage] = useState(1)
    const [pageSize,setPageSize] = useState(STAT_PAGE_SIZE)
    const [total,setTotal] = useState(0)
    const [list,setList] = useState([])
const {loading}=useRequest(async () => {
  const res = await getQuestionStatListService(id,{page,pageSize})
  return res
},{refreshDeps:[id,page,pageSize],
    onSuccess: (res) => {
        const {total,list=[]} = res
        setTotal(total)
        setList(list)
    },

}
)
const {componentList} = useGetComponentInfo()
const columns=componentList.map(c => {
    const {fe_id,title,props={},type} = c
    const colTitle = props!.title || title
    return {    
        title: <div style={{cursor:'pointer'}}>
          <span style={{color:fe_id===selectedComponentId?'#1890ff':'inherit'}} onClick={() => {
            setSelectedComponentId(fe_id)
            setselectedComponentType(type)
          }}>{colTitle}</span>
          </div>,

        
        dataIndex:fe_id
    }
})
const dataSource = list.map((i: any) => ({ ...i, key: i._id }))
const TableElem = <>

    <Table columns={columns} dataSource={dataSource} pagination={false} />
    <div style={{textAlign:'center',marginTop:'18px'}}>
         <Pagination total={total} pageSize={pageSize} current={page} onChange={(page) => {
        setPage(page)
    }}  onShowSizeChange={(page,pageSize) => {
        setPage(page)
        setPageSize(pageSize)
    }}  style={{marginTop:'20px',textAlign:'right'}} />  
    </div>

</>


    return (
        <div>
           <Title level={3}>答卷数量: {!loading&&total}</Title>
           {
            loading&&(
                <div style={{textAlign:'center'}}>
                    <Spin />
                </div>
            )
           }
           {!loading&&TableElem}
        </div>
    )
}
export default PageStat
