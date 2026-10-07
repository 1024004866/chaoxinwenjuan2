import { useEffect, useState } from 'react'
import { getUserInfoService } from '../services/user'
import { loginReducer } from '../store/userReducer'
import useGetUserInfo from './useGetUserInfo'
import { useDispatch } from 'react-redux'
import { getToken, removeToken } from '../utills/user-token'

function useLoadUserData() {
  const [waitingUserData, setWaitingUserData] = useState(true)
  const dispatch = useDispatch()
  const { username } = useGetUserInfo()

  useEffect(() => {
    if (username) {
      setWaitingUserData(false)
      return
    }
    if (!getToken()) {
      setWaitingUserData(false)
      return
    }
    let active = true
    setWaitingUserData(true)
    getUserInfoService()
      .then(result => {
        if (!active) return
        const { username, nickname } = result
        dispatch(loginReducer({ username, nickname }))
      })
      .catch(() => {
        removeToken()
      })
      .finally(() => {
        if (active) setWaitingUserData(false)
      })

    return () => {
      active = false
    }
  }, [username, dispatch])

  return { waitingUserData }
}

export default useLoadUserData
