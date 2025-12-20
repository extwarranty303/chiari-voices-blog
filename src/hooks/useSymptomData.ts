import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface JournalEntry {
  id: string;
  symptoms?: string[];
  date: any;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export const useSymptomData = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAndProcessData = async () => {
      try {
        const journalRef = collection(db, 'users', user.uid, 'journals');
        const snapshot = await getDocs(journalRef);
        const entries: JournalEntry[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));

        if (entries.length === 0) {
          setChartData(null);
          setLoading(false);
          return;
        }

        const symptomCounts: { [key: string]: number } = {};
        entries.forEach(entry => {
          entry.symptoms?.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
          });
        });

        const sortedSymptoms = Object.entries(symptomCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
        const labels = sortedSymptoms.map(([symptom]) => symptom);
        const data = sortedSymptoms.map(([, count]) => count);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Top 10 Symptom Frequency',
              data,
              backgroundColor: 'rgba(138, 92, 246, 0.2)',
              borderColor: 'rgba(138, 92, 246, 1)',
              borderWidth: 1,
            },
          ],
        });

      } catch (e) {
        console.error("Error fetching symptom data: ", e);
        setError('Failed to fetch symptom data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [user]);

  return { chartData, loading, error };
};
