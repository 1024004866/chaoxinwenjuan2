import { useRequest } from 'ahooks'
import { useEffect, useState } from 'react'
import { getUserInfoService } from '../services/user'
import { loginReducer } from '../store/userReducer'
import useGetUserInfo from './useGetUserInfo'
import { useDispatch } from 'react-redux'
import { getToken } from '../utills/user-token'

function useLoadUserData() {
  const [waitingUserData, setWaitingUserData] = useState(true)
  const dispatch = useDispatch()
  const { username } = useGetUserInfo()

  // 只请求一次，不会无限循环
  const { run } = useRequest(getUserInfoService, {
    manual: true,
    onSuccess(result) {
      const { username, nickname } = result
      dispatch(loginReducer({ username, nickname }))
    },
    onFinally() {
      setWaitingUserData(false)
    },
  })

  useEffect(() => {
    if (username) {
      setWaitingUserData(false)
      return
    }
    if (!getToken()) {
      setWaitingUserData(false)
      return
    }
    run()
  }, [username, run])

  return { waitingUserData }
}

export default useLoadUserData
