
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useSymptomData } from '../../hooks/useSymptomData';

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

  if (loading) return <div className="text-center text-gray-400">Loading chart...</div>;
  if (error) return <div className="text-center text-red-400">Error loading chart data.</div>;
  if (!chartData || chartData.labels.length === 0) {
    return <div className="text-center text-gray-400">No symptom data available to display.</div>;
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#E5E7EB', // Light gray for legend text
        }
      },
      title: {
        display: true,
        text: 'Symptom Frequency',
        color: '#FFFFFF', // White for title
        font: {
            size: 16
        }
      },
    },
    scales: {
        x: {
            ticks: {
                color: '#D1D5DB', // Lighter gray for x-axis labels
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)', // Subtle grid lines
            }
        },
        y: {
            ticks: {
                color: '#D1D5DB', // Lighter gray for y-axis labels
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)', // Subtle grid lines
            }
        }
    }
  };

  return (
    <div className="h-64">
      <Bar options={options} data={chartData} />
    </div>
  );
}
