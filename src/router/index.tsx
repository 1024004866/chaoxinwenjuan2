import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ManageLayout from '../layouts/ManageLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import NotFound from '../pages/NotFound'
import List from '../pages/Manage/List'
import Trash from '../pages/Manage/Trash'
import Star from '../pages/Manage/Star'
import Edit from '../pages/question/Edit'
import Stat from '../pages/question/Stat'
import PublicQuestion from '../pages/question/PublicQuestion'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'manage',
        element: <ManageLayout />,
        children: [
          { index: true, element: <List /> },
          { path: 'list', element: <List /> },
          { path: 'star', element: <Star /> },
          { path: 'trash', element: <Trash /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },

  {
    path: 'question',
    children: [
      { path: ':id', element: <PublicQuestion /> },
      { path: 'edit/:id', element: <Edit /> },
      { path: 'stat/:id', element: <Stat /> },
    ],
  },
])
export default router

export const HOME_PATHNAME = '/'
export const LOGIN_PATHNAME = '/login'
export const REGISTER_PATHNAME = '/register'
export const MANAGE_INDEX_PATHNAME = '/manage/list'
export function isLoginOrRegister(pathname: string) {
  if ([LOGIN_PATHNAME, REGISTER_PATHNAME].includes(pathname)) return true
  return false
}
export function isNoNeedUserInfo(pathname: string) {
  if ([HOME_PATHNAME, LOGIN_PATHNAME, REGISTER_PATHNAME].includes(pathname)) return true
  return false
}
