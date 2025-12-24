
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface JournalEntry {
  id: string;
  symptoms?: string[];
  createdAt: Timestamp;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export const useSymptomData = () => {
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        (async () => {
            setLoading(false);
        })();
      return;
    }

    const q = query(collection(db, 'journalEntries'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries: JournalEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
      });

      if (entries.length === 0) {
        setChartData({ labels: [], datasets: [] });
        setLoading(false);
        return;
      }

      const symptomCounts: { [key: string]: number } = {};
      entries.forEach(entry => {
        entry.symptoms?.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      });

      const sortedSymptoms = Object.entries(symptomCounts).sort(([, a], [, b]) => b - a).slice(0, 7);
      const labels = sortedSymptoms.map(([symptom]) => symptom);
      const data = sortedSymptoms.map(([, count]) => count);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Symptom Frequency',
            data,
            backgroundColor: 'rgba(107, 33, 168, 0.6)',
            borderColor: 'rgba(126, 34, 206, 1)',
            borderWidth: 1,
          },
        ],
      });
      setLoading(false);
    }, (err) => {
      console.error("Error fetching symptom data: ", err);
      setError('Failed to fetch symptom data.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { chartData, loading, error };
};
