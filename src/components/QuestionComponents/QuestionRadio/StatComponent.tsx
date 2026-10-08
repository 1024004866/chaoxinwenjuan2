import React, { FC, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { STAT_COLORS } from '../../../constant'
import { QuestionRadioStatPropsType } from './interface'

function format(n:number) {
    return Number.isFinite(n) ? (n*100).toFixed(2) : '0.00'
}

const StatComponent: FC<QuestionRadioStatPropsType> = ({ stat = [] }) => {
  const sum = useMemo(() => stat.reduce((total, item) => total + item.count, 0), [stat])
  const chartData = useMemo(
    () =>
      stat.map(item => ({
        ...item,
        displayName: `${item.name}: ${format(item.count / sum)}%`,
      })),
    [stat, sum]
  )

  if (sum === 0) {
    return <div style={{ padding: '48px 0', textAlign: 'center', color: '#999' }}>暂无数据</div>
  }

  return (
    <div style={{ width: '100%', height: '320px', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <Pie
            dataKey="count"
            nameKey="displayName"
            data={chartData}
            cx="50%"
            cy="42%"
            outerRadius={72}
            fill="#8884d8"
          >
            {chartData.map((item, index) => (
              <Cell key={item.name} fill={STAT_COLORS[index % STAT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" align="center" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StatComponent
