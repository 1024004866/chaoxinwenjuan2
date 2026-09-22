import React,{FC} from "react";
import { Button, Tooltip, Space } from 'antd'
import { DeleteOutlined, EyeInvisibleOutlined ,LockOutlined,CopyOutlined,BlockOutlined,UpOutlined,DownOutlined,UndoOutlined,RedoOutlined} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { removeSelectedComponent ,changeComponentHidden,toggleComponentLocked, copySelectedComponent, moveComponent,pasteCopiedComponent } from "../../../store/componentsReducer";
import useGetComponentInfo from "../../../hooks/useGetComponentInfo";
import { ActionCreators as UndoActionCreators } from "redux-undo";

const EditToolbar: FC = () => {
    const dispatch = useDispatch()
    const {selectedId,selectedComponent,copiedComponent,componentList} = useGetComponentInfo()
    const {isLocked }= selectedComponent||{}
    const length = componentList.length 
    const selectedIndex = componentList.findIndex(item => item.fe_id === selectedId)
    const isLast = selectedIndex + 1 >= length
    const isFirst=selectedIndex<=0

    //删除组件
    function handleDelete() {
        dispatch(removeSelectedComponent())
    }
    //隐藏组件
    function handleHide() {
        dispatch(changeComponentHidden({fe_id:selectedId,isHidden:true}))
    }
    //锁定组件
    function handleLock() {
        dispatch(toggleComponentLocked({fe_id:selectedId}))
    }
    //复制组件
    function handleCopy() {
       dispatch(copySelectedComponent())
    }
    //粘贴组件
    function handlePaste() {
         dispatch(pasteCopiedComponent())
    }   
    //上移
    function moveUp(){
        if(isFirst) return 
        dispatch(moveComponent({oldIndex:selectedIndex,newIndex:selectedIndex-1}))
    }
    //下移
    function moveDown(){
        if(isLast) return 
        dispatch(moveComponent({oldIndex:selectedIndex,newIndex:selectedIndex+1}))
    }
    //撤消
    function undo(){
        dispatch(UndoActionCreators.undo())
    }
    //【bug1修复：重做必须dispatch】
    function redo(){
        dispatch(UndoActionCreators.redo())
    }

    return (
            <Space>
                <Tooltip title="删除">
                    <Button shape="circle" icon={<DeleteOutlined />} onClick={handleDelete} />
                </Tooltip>
                <Tooltip title="隐藏">
                    <Button shape="circle" icon={<EyeInvisibleOutlined />} onClick={handleHide} />
                </Tooltip>
                <Tooltip title ="锁定">
                    <Button shape="circle" icon={<LockOutlined />} onClick={handleLock}  type={isLocked ? "primary" : "default"}/>
                </Tooltip>
                <Tooltip title ="复制">
                    <Button shape="circle" icon={<CopyOutlined />} onClick={handleCopy}/>
                </Tooltip>
                {/*【bug2: !copiedComponent==null → 改成 !copiedComponent，没复制内容禁用粘贴】*/}
                <Tooltip title ="粘贴">
                    <Button shape="circle" icon={<BlockOutlined />} onClick={handlePaste}  disabled={!copiedComponent}/>
                </Tooltip>
                 <Tooltip title="上移">
                    <Button shape="circle" icon={<UpOutlined />} disabled={isFirst} onClick={moveUp} />
                </Tooltip>
                <Tooltip title="下移">
                    <Button shape="circle" icon={<DownOutlined />} disabled={isLast} onClick={moveDown} />
                </Tooltip>
                <Tooltip title="撤销">
                    <Button shape="circle" icon={<UndoOutlined />}  onClick={undo} />
                </Tooltip>
                <Tooltip title="重做">
                    <Button shape="circle" icon={<RedoOutlined />}  onClick={redo} />
                </Tooltip>
             </Space>
    );
};

export default EditToolbar;