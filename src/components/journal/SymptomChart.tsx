import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useSymptomData } from '../../hooks/useSymptomData'; // This hook will be created next

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SymptomChart() {
  const { chartData, loading, error } = useSymptomData();

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart data.</div>;
  if (!chartData) return <div>No symptom data available.</div>;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Symptom Frequency Over Time',
      },
    },
  };

  return <Bar options={options} data={chartData} />;
}
