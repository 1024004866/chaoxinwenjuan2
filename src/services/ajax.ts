import { message } from 'antd' //鍙戦€佽姹?鈫?鎺ユ敹鍚庣杩斿洖鐨勬暟鎹?
import axios from 'axios'
import { getToken } from '../utills/user-token'
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  timeout: 10 * 1000,
})
// request 鎷︽埅锛氭瘡娆¤姹傞兘甯︿笂 token
instance.interceptors.request.use(
  config => {
    config.headers['Authorization'] = `Bearer ${getToken()}` // JWT 鐨勫浐瀹氭牸寮?
    return config
  },
  error => Promise.reject(error)
)
//response鎷︽埅锛氱粺涓€澶勭悊errno鍜宮sg
//杩欐浣滅敤锛氱粺涓€澶勭悊閿欒锛岃嚜鍔ㄥ脊鎻愮ず
//鎴愬姛鏃跺彧杩斿洖 data锛岄〉闈㈡洿绠€娲?
//鏍囧噯鍖栨墍鏈夋帴鍙ｅ搷搴?
instance.interceptors.response.use(res => {
  const resData = (res.data || {}) as ResType

  const { errno, data, msg } = resData

  if (errno !== 0) {
    message.error(msg || '请求失败')
    throw new Error(msg || '请求失败')
  }
  return data
}, error => {
  const msg = error.response?.data?.msg || (error.code === 'ECONNABORTED' ? '请求超时，请稍后重试' : '网络异常，请确认 API 服务已启动')
  message.error(msg)
  return Promise.reject(error)
})
export default instance
export type ResType = {
  errno: number
  data?: any
  msg?: string
}
export type ResDataType = {
  [key: string]: any
}

