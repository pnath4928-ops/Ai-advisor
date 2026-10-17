import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: Record<string, number>;
}

export const GradeDistributionChart = ({ data }: Props) => {
  const chartData = Object.entries(data).map(([grade, count]) => ({
    grade,
    count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="grade" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1C2233',
            border: '1px solid rgba(124, 92, 255, 0.2)',
            borderRadius: '8px',
            color: '#E8E8ED',
          }}
        />
        <Bar dataKey="count" fill="#7C5CFF" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={350} animationEasing="ease-out" animationBegin={80} />
      </BarChart>
    </ResponsiveContainer>
  );
};
