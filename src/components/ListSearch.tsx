import React, { FC, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Input } from 'antd'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { LIST_SEARCH_PARAM_KEY } from '../constant'
const { Search } = Input

const ListSearch: FC = () => {
  const [value, setValue] = useState('')
  const { pathname } = useLocation()
  const nav = useNavigate()
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value)
  }
  //获取url参数，并设置input value
  const [SearchParams] = useSearchParams()
  useEffect(() => {
    const curVal = SearchParams.get(LIST_SEARCH_PARAM_KEY) || ''
    setValue(curVal)
  }, [SearchParams])
  function handleSearch(value: string) {
    nav({
      pathname,
      search: `keyword=${value}`,
    })
  }

  return (
    <Search
      size="large"
      allowClear
      placeholder="输入关键字"
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      style={{ width: '260px' }}
    />
  )
}

export default ListSearch
