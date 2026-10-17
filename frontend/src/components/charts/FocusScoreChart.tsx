import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { date: string; focusScore: number }[];
}

export const FocusScoreChart = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 10]} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1C2233',
            border: '1px solid rgba(124, 92, 255, 0.2)',
            borderRadius: '8px',
            color: '#E8E8ED',
          }}
        />
        <Line
          type="monotone"
          dataKey="focusScore"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={{ fill: '#F59E0B' }}
          isAnimationActive
          animationDuration={350}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
