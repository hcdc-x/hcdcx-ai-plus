'use client';

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface PieChartProps {
  data: Array<{ device: string; count: number }>;
}

interface BarChartProps {
  data: Array<{ range: string; count: number }>;
}

const PIE_COLORS = ['#00FFFF', '#0080FF', '#A020F0', '#FF00FF', '#FFFF00'];
const BAR_COLOR = '#00FFFF';

export function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No device data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="count"
          nameKey="device"
          stroke="transparent"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
              style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            color: '#fff',
          }}
          itemStyle={{ color: '#00FFFF' }}
        />
      </RePieChart>
    </ResponsiveContainer>
  );
}

export function BarChart({ data }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No risk data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            color: '#fff',
          }}
          itemStyle={{ color: '#00FFFF' }}
        />
        <Bar
          dataKey="count"
          fill={BAR_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
          style={{ filter: 'drop-shadow(0 0 4px #00FFFF55)' }}
        />
      </ReBarChart>
    </ResponsiveContainer>
  );
}