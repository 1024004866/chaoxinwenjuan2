import React ,{FC, useState} from "react";
import {Button,Typography,Space, Input, message} from 'antd'
import {useNavigate, useParams} from 'react-router-dom'
import {LeftOutlined,EditOutlined, LoadingOutlined} from '@ant-design/icons'
import styles from './EditHeader.module.scss'
import useGetPageInfo from "../../../hooks/useGetPageInfo";
import useGetComponentInfo from "../../../hooks/useGetComponentInfo";
import EditToolbar from "./EditToolbar";
import {changePageTitle} from '../../../store/pageInfoReducer'
import {useDispatch} from 'react-redux' 
import { updateQuestionService } from "../../../services/question";
import { useDebounceEffect, useKeyPress, useRequest } from "ahooks";
const {Title} = Typography
//显示和修改标题
const TitleElem:FC=()=>{
    const {title} = useGetPageInfo();
    const dispatch = useDispatch()
    const [editState,setEditState] = useState(false)
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newTitle = event.target.value.trim()
        if (newTitle === '') {
            return
        }
        dispatch(changePageTitle(newTitle))
    }

    if(editState) {
        return <Input value={title} onPressEnter={()=>setEditState(false)} onBlur={()=>setEditState(false)}  onChange={handleChange}/>
    }

    return <Space>
        <Title>{title}</Title>
            <Button icon={<EditOutlined />} type="text" onClick={() => {setEditState(true)}}/>
    </Space>
}
//保存按钮
const SaveButton:FC=()=>{
    const{id}= useParams()
    const {componentList=[]} = useGetComponentInfo();
    const pageInfo = useGetPageInfo();
    const {loading,run:save}=useRequest(async () => {
        if(!id) return;
        await updateQuestionService(id,{
            ...pageInfo,
            componentList   
        })  

    },{
        manual:true
    })
    //快捷键
    useKeyPress('ctrl.s',(event:KeyboardEvent)=>{
        event.preventDefault();
        save()
    })
    //自动保存(不是定期保存，不是定时器)
    useDebounceEffect(()=>{
        save()
    },[pageInfo,componentList],{
        wait:1000,
    })  //防抖

    return (
        <Button  onClick={save} loading={loading}>
            保存
        </Button>
    )
}
//发布保存
const PublishButton: FC = () => {
    const nav= useNavigate();
  const { id } = useParams();
  const { componentList = [] } = useGetComponentInfo();
  const pageInfo = useGetPageInfo();

  const { loading, run: publish } = useRequest(
    async () => {
      if (!id) return;
      await updateQuestionService(id, {
        ...pageInfo,
        componentList,
        isPublished: true, // 标记已发布
      });
    },
    { manual: true,
         onSuccess: () => {
            message.success("发布成功");
            nav(`/question/stat/`+id); // 发布后跳转到统计页
          }

     }
  );

  // 给发布也加快捷键， ctrl + p
  useKeyPress("ctrl.p", (event: KeyboardEvent) => {
    event.preventDefault();
    publish();
  });

  return (
    <Button
      onClick={publish}
      disabled={loading}
      type="primary"
      icon={loading ? <LoadingOutlined /> : null}
    >
      发布
    </Button>
  );
};
    //编辑器头部
const EditHeader:FC=()=>{
    const nav = useNavigate();
    return <div className={styles['header-wrapper']}>
        <div className={styles.header}>
            <div className={styles.left}>
                <Space>
                    <Button type="link" icon={<LeftOutlined />} onClick={() => nav(-1)}>
                    返回
                </Button>
                <TitleElem/>
                </Space>
            </div>
            <div className={styles.main}>
                <EditToolbar/>
            </div>
            <div className={styles.right}>
               <Space size="middle">
               <SaveButton/>
               <PublishButton/>
               </Space>
            </div>
        </div>
    </div>
}

export default EditHeader
