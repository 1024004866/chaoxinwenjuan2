import React, { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Spin } from 'antd'
import MainLayout from '../layouts/MainLayout'
import ManageLayout from '../layouts/ManageLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import NotFound from '../pages/NotFound'

const List = lazy(() => import('../pages/Manage/List'))
const Trash = lazy(() => import('../pages/Manage/Trash'))
const Star = lazy(() => import('../pages/Manage/Star'))
const Edit = lazy(() => import('../pages/question/Edit'))
const Stat = lazy(() => import('../pages/question/Stat'))
const PublicQuestion = lazy(() => import('../pages/question/PublicQuestion'))

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spin size="large" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

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
          { index: true, element: <LazyPage><List /></LazyPage> },
          { path: 'list', element: <LazyPage><List /></LazyPage> },
          { path: 'star', element: <LazyPage><Star /></LazyPage> },
          { path: 'trash', element: <LazyPage><Trash /></LazyPage> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },

  {
    path: 'question',
    children: [
      { path: ':id', element: <LazyPage><PublicQuestion /></LazyPage> },
      { path: 'edit/:id', element: <LazyPage><Edit /></LazyPage> },
      { path: 'stat/:id', element: <LazyPage><Stat /></LazyPage> },
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
