import React, { FC, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { STAT_COLORS } from '../../../constant'
import { QuestionRadioStatPropsType } from './interface'

type LabelType = {
  name?: string | number
  payload?: {
    count: number
  }
}
function format(n:number) {
    return Number.isFinite(n) ? (n*100).toFixed(2) : '0.00'
}

const StatComponent: FC<QuestionRadioStatPropsType> = ({ stat = [] }) => {
    const sum=useMemo(() => {
       let s =0 
       stat.forEach(i=>s+=i.count)
       return s
    }, [stat])
         
  return (
    <div style={{ width: '300px', height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="count"
            data={stat}
            cx="50%"//x轴的偏移
            cy="50%"//y轴的偏移
            outerRadius={50}
            fill="#8884d8"
            label={i => {
              const item = i as LabelType
              return `${item.name}: ${format((item.payload?.count || 0) / sum)}%`
            }}
          >
            {stat.map((item, index) => (
              <Cell key={item.name} fill={STAT_COLORS[index % STAT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StatComponent
