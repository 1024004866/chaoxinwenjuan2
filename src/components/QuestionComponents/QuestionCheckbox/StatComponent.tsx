import React, { FC } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { QuestionCheckboxStatPropsType } from './interface'

const StatComponent: FC<QuestionCheckboxStatPropsType> = ({ stat = [] }) => {
  return (
    <div style={{ width: '100%', height: '300px', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={stat}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StatComponent
