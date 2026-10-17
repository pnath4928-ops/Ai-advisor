import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { subject: string; score: number; attendanceRate: number }[];
}

export const SubjectPerformanceChart = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="subject" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1C2233',
            border: '1px solid rgba(124, 92, 255, 0.2)',
            borderRadius: '8px',
            color: '#E8E8ED',
          }}
        />
        <Legend />
        <Bar dataKey="score" fill="#7C5CFF" name="Score" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={350} animationEasing="ease-out" animationBegin={0} />
        <Bar dataKey="attendanceRate" fill="#22C55E" name="Attendance %" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={350} animationEasing="ease-out" animationBegin={80} />
      </BarChart>
    </ResponsiveContainer>
  );
};
