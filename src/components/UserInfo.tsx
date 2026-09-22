import { UserOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import React, { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LOGIN_PATHNAME } from '../router'
import { removeToken } from '../utills/user-token'
import useGetUserInfo from '../hooks/useGetUserInfo'
import { useDispatch } from 'react-redux'
import { logoutReducer } from '../store/userReducer'
const UserInfo: FC = () => {
  const nav = useNavigate()
  const dispatch = useDispatch()
  const { username, nickname } = useGetUserInfo()
  function logout() {
    dispatch(logoutReducer())
    removeToken() //清除token的存储
    message.success('退出成功')
    nav(LOGIN_PATHNAME)
  }
  const UserInfoEle = (
    <>
      <span style={{ color: '#e8e8e8' }}>
        <UserOutlined />
        {nickname}
      </span>
      <Button type="link" onClick={logout}>
        退出
      </Button>
    </>
  )

  const Login = <Link to={LOGIN_PATHNAME}>登录</Link>

  return <div>{username ? UserInfoEle : Login}</div>
}

export default UserInfo
