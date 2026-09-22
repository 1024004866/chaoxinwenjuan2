import React ,{ FC,useRef }from 'react'
import style from './StatHeader.module.scss'
import { useNavigate,useParams } from 'react-router-dom'
import{Space,Button,Typography, Input,Tooltip, InputRef,message,Popover} from 'antd'
import { CopyOutlined, LeftOutlined,QrcodeOutlined } from '@ant-design/icons'
import useGetPageInfo from "../../../hooks/useGetPageInfo"
import { QRCodeCanvas } from 'qrcode.react'
const {Title} = Typography
const StatHeader: FC = () => {
  const nav = useNavigate()
  const { id } = useParams()
  const { title,isPublished} = useGetPageInfo()
  //拷贝链接
  const urlRef = useRef<InputRef>(null)
  function copy() {
    const elem = urlRef.current
    if (elem==null) return
    navigator.clipboard?.writeText(elem.input?.value || '').then(() => message.success('拷贝成功'))
  }
  function genLinkAndQRCodeElem() {
    if (!isPublished) {
      return null
    }
    // 生成链接和二维码元素的逻辑 c端
   const url = `${window.location.origin}/question/${id}`
const QRCodeElem = <div style={{ textAlign: 'center' }}><QRCodeCanvas value={url} size={150} /></div>
    return <Space>
      <Input ref={urlRef}  value={url} style={{ width: '300px' }}/>
      <Tooltip title="复制链接">
        <Button icon={<CopyOutlined />} onClick={copy}>
          复制链接
        </Button>
      </Tooltip>
      <Popover content={QRCodeElem} >
        <Button icon={<QrcodeOutlined />} >
          二维码
        </Button>
      </Popover>  
    </Space>


  }

  return (
    <div className={style['header-wrapper']}>
      <div className={style.header}>
        <div className={style.left}>
          <Space>
            <Button type="link" icon={<LeftOutlined />} onClick={() => nav(-1)} >
              返回
            </Button>
            <Title >
             {title}
            </Title>
          </Space>
        </div>
        <div className={style.main}>
          {genLinkAndQRCodeElem()}
        </div>
        <div className={style.right}>
         <Button type="primary" onClick={() => nav(`/question/edit/${id}`)}>
            编辑问卷
          </Button>
        </div>
      </div>
    </div>
  )
}   
export default StatHeader
