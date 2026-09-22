import userReducer, { loginReducer, logoutReducer } from './store/userReducer'
import pageInfoReducer, { changePageTitle } from './store/pageInfoReducer'

test('stores authenticated user information', () => {
  const state = userReducer(undefined, loginReducer({ username: 'demo', nickname: '演示用户' }))
  expect(state).toEqual({ username: 'demo', nickname: '演示用户' })
  expect(userReducer(state, logoutReducer())).toEqual({ username: '', nickname: '' })
})

test('updates questionnaire page title', () => {
  const state = pageInfoReducer({ title: '旧标题', desc: '' }, changePageTitle('新标题'))
  expect(state.title).toBe('新标题')
})
