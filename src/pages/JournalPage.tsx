
import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import SymptomChart from '../components/journal/SymptomChart';
import TiptapEditor from '../components/TiptapEditor';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  symptoms?: string[];
}

export default function JournalPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p>Start writing your journal entry...</p>');
  const [symptoms, setSymptoms] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      let q = query(collection(db, 'journalEntries'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      
      if (selectedSymptom) {
        q = query(collection(db, 'journalEntries'), where('userId', '==', user.uid), where('symptoms', 'array-contains', selectedSymptom), orderBy('createdAt', 'desc'));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const journalEntries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
          journalEntries.push({ id: doc.id, ...doc.data() } as JournalEntry);
        });
        setEntries(journalEntries);
      });

      return () => unsubscribe();
    }
  }, [user, selectedSymptom]);

  const handleSave = async () => {
    if (user && content) {
      const processedSymptoms = symptoms.split(',').map(s => s.trim()).filter(s => s);
      await addDoc(collection(db, 'journalEntries'), {
        userId: user.uid,
        title: title,
        content: content,
        createdAt: serverTimestamp(),
        symptoms: processedSymptoms,
      });
      setTitle('');
      setContent('<p>Start writing your new journal entry...</p>');
      setSymptoms('');
    }
  };
  
  const allSymptoms = [...new Set(entries.flatMap(entry => entry.symptoms || []))];

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: New Journal Entry */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6">New Journal Entry</h1>
            <div className="mb-4">
              <Input
                label="Entry Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 'Headache this morning'"
                className="w-full bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div className="mb-4">
              <TiptapEditor value={content} onChange={setContent} />
            </div>
            <div className="mb-6">
              <Input
                label="Tag symptoms, comma-separated"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., headache, fatigue, nausea"
                className="w-full bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Entry
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Past Entries & Chart */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Past Entries</h2>
              <Button variant="outline" size="sm" onClick={() => { /* Logic to show chart */ }}>
                Show Chart
              </Button>
            </div>
            <div className="mb-4">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entries..."
                className="w-full bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div className="mb-4">
              <select
                value={selectedSymptom || ''}
                onChange={(e) => setSelectedSymptom(e.target.value || null)}
                className="w-full bg-gray-700 text-white border-gray-600 rounded p-2"
              >
                <option value="">All Symptoms</option>
                {allSymptoms.map(symptom => (
                  <option key={symptom} value={symptom}>{symptom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="bg-gray-700 p-4 rounded">
                    <h3 className="font-bold text-white">{entry.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(entry.createdAt?.toDate()).toLocaleString()}
                    </p>
                    <div
                      className="prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: entry.content.substring(0, 100) + '...' }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center">No entries found. Try adjusting your search or filter.</p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-8">
             <SymptomChart />
          </div>
        </div>
      </div>
    </div>
  );
}
