import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { subject: string; attendanceRate: number }[];
}

export const AttendanceChart = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="subject" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1C2233',
            border: '1px solid rgba(124, 92, 255, 0.2)',
            borderRadius: '8px',
            color: '#E8E8ED',
          }}
        />
        <Bar
          dataKey="attendanceRate"
          fill="#22C55E"
          radius={[4, 4, 0, 0]}
          isAnimationActive
          animationDuration={350}
          animationEasing="ease-out"
          animationBegin={80}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
