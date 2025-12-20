import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import SymptomChart from '../components/journal/SymptomChart';
import TiptapEditor from '../components/TiptapEditor';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

interface JournalEntry {
  id: string;
  content: string;
  createdAt: any;
  symptoms?: string[];
}

export default function JournalPage() {
  const { user } = useAuth();
  const [content, setContent] = useState('<p>Start writing your journal entry...</p>');
  const [symptoms, setSymptoms] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'journalEntries'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const journalEntries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
          journalEntries.push({ id: doc.id, ...doc.data() } as JournalEntry);
        });
        setEntries(journalEntries);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSave = async () => {
    if (user && content) {
      const processedSymptoms = symptoms.split(',').map(s => s.trim()).filter(s => s);
      await addDoc(collection(db, 'journalEntries'), {
        userId: user.uid,
        content: content,
        createdAt: serverTimestamp(),
        symptoms: processedSymptoms,
      });
      setContent('<p>Start writing your new journal entry...</p>');
      setSymptoms('');
    }
  };

  return (
    <div className="glass-panel p-6 md:p-8">
      <h1 className="text-3xl font-bold text-surface mb-8">Your Health Journal</h1>
      <div className="mb-8">
        <SymptomChart />
      </div>
      <div className="mb-8">
        <TiptapEditor value={content} onChange={setContent} />
      </div>
      <div className="mb-8">
        <Input 
          label="Symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter symptoms, separated by commas (e.g., headache, fatigue)"
        />
      </div>
      <div className="flex justify-end mb-8">
        <Button onClick={handleSave}>Save Entry</Button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-surface mb-4">Past Entries</h2>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="glass-panel p-4">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
              {entry.symptoms && entry.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {entry.symptoms.map((symptom, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">
                      {symptom}
                    </span>
                  ))}
                </div>
              )}
               <p className="text-xs text-muted mt-2">
                {new Date(entry.createdAt?.toDate()).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
