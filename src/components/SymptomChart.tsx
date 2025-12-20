import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  symptoms: string[];
  createdAt: Timestamp;
}

interface SymptomChartProps {
  entries: JournalEntry[];
}

export default function SymptomChart({ entries }: SymptomChartProps) {
  const symptomFrequency = useMemo(() => {
    const symptomCounts = new Map<string, number>();
    entries.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);
      });
    });
    return Array.from(symptomCounts.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const symptomTrends = useMemo(() => {
    const trendData: { [symptom: string]: { [date: string]: number } } = {};
    const allDates = new Set<string>();

    entries.forEach(entry => {
        const date = new Date(entry.createdAt?.toDate()).toLocaleDateString();
        allDates.add(date);
        entry.symptoms.forEach(symptom => {
            if (!trendData[symptom]) trendData[symptom] = {};
            if (!trendData[symptom][date]) trendData[symptom][date] = 0;
            trendData[symptom][date]++;
        });
    });

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const datasets = Object.keys(trendData).map((symptom, index) => {
      const color = `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
      return {
        label: symptom,
        data: sortedDates.map(date => trendData[symptom][date] || 0),
        fill: false,
        borderColor: color,
        tension: 0.1
      };
    });

    return {
      labels: sortedDates,
      datasets
    };
}, [entries]);

  const barData = {
    labels: symptomFrequency.map(sf => sf[0]),
    datasets: [{
      label: 'Symptom Frequency',
      data: symptomFrequency.map(sf => sf[1]),
      backgroundColor: 'rgba(128, 90, 213, 0.6)',
      borderColor: 'rgba(128, 90, 213, 1)',
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Symptom Analysis',
        color: '#FFFFFF',
        font: {
          size: 18
        }
      },
    },
    scales: {
        x: {
            ticks: { color: '#FFFFFF' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
            ticks: { color: '#FFFFFF' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
    }
  };

  return (
    <div className="space-y-8">
        <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">Symptom Frequency</h3>
            <Bar options={options} data={barData} />
        </div>
        <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">Symptom Trends Over Time</h3>
            <Line options={options} data={symptomTrends} />
        </div>
    </div>
  );
}