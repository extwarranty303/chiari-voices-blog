import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GlassPanel, Button, Input, Modal, Select } from '../components/ui';
import SEO from '../components/SEO';
import { Trash2, Edit, BarChart2 } from 'lucide-react';
import SymptomChart from '../components/SymptomChart';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  symptoms: string[];
  createdAt: any;
}

export default function JournalPage() {
  const [user] = useAuthState(auth);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'journals'), 
        where('userId', '==', user.uid), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const userEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
      setEntries(userEntries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const symptomsArray = newSymptoms.split(',').map(s => s.trim()).filter(Boolean);
      await addDoc(collection(db, 'journals'), {
        userId: user.uid,
        title: newTitle,
        content: newContent,
        symptoms: symptomsArray,
        createdAt: serverTimestamp(),
      });
      setNewTitle('');
      setNewContent('');
      setNewSymptoms('');
      fetchEntries();
    } catch (error) {
      console.error("Error adding new journal entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteDoc(doc(db, 'journals', entryId));
        setEntries(entries.filter(entry => entry.id !== entryId));
      } catch (error) {
        console.error("Error deleting journal entry:", error);
      }
    }
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const entryRef = doc(db, 'journals', editingEntry.id);
      await updateDoc(entryRef, {
        title: editingEntry.title,
        content: editingEntry.content,
        symptoms: editingEntry.symptoms
      });
      setEditingEntry(null);
      fetchEntries();
    } catch (error) {
      console.error("Error updating journal entry:", error);
    }
  };

  const allSymptoms = useMemo(() => {
    const symptoms = new Set<string>();
    entries.forEach(entry => entry.symptoms?.forEach(symptom => symptoms.add(symptom)));
    return Array.from(symptoms);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const searchMatch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || entry.content.toLowerCase().includes(searchTerm.toLowerCase());
      const symptomMatch = selectedSymptom ? entry.symptoms.includes(selectedSymptom) : true;
      return searchMatch && symptomMatch;
    });
  }, [entries, searchTerm, selectedSymptom]);


  if (!user) {
    return <div>Please log in to view your journal.</div>;
  }

  return (
    <div className="space-y-8">
      <SEO title="My Journal" description="Your private space to track symptoms and document your health journey." />
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-white">My Private Journal</h1>
        <p className="text-lg text-surface/70 mt-2">A secure space to log your thoughts and track your health.</p>
      </header>

      <GlassPanel className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">New Journal Entry</h2>
        <form onSubmit={handleAddEntry} className="space-y-6">
          <Input 
            type="text"
            placeholder="Entry Title (e.g., 'Headache this morning')"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <textarea 
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)} 
            placeholder="Write about your day, symptoms, or feelings..."
            className="w-full p-3 bg-white text-gray-900 rounded-lg h-48 prose"
          />
          <Input 
            type="text"
            placeholder="Tag symptoms, comma-separated (e.g., headache, fatigue, nausea)"
            value={newSymptoms}
            onChange={(e) => setNewSymptoms(e.target.value)}
          />
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </Button>
        </form>
      </GlassPanel>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Past Entries</h2>
          <Button variant="secondary" onClick={() => setShowChart(!showChart)}>
            <BarChart2 size={16} className="mr-2" />
            {showChart ? 'Hide' : 'Show'} Chart
          </Button>
        </div>

        {showChart && (
          <GlassPanel className="p-8 mb-6">
            <SymptomChart entries={entries} />
          </GlassPanel>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input 
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2"
          />
          <Select
            value={selectedSymptom}
            onChange={(e) => setSelectedSymptom(e.target.value)}
            className="w-full md:w-1/2"
          >
            <option value="">All Symptoms</option>
            {allSymptoms.map(symptom => (
              <option key={symptom} value={symptom}>{symptom}</option>
            ))}
          </Select>
        </div>
        
        {loading ? (
          <p className="text-center">Loading entries...</p>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <GlassPanel key={entry.id} className="p-6 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{entry.title}</h3>
                  <p className="text-sm text-surface/60 mb-2">
                    {new Date(entry.createdAt?.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingEntry(entry)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className="prose prose-invert max-w-none text-surface/80 whitespace-pre-wrap">
                {entry.content}
              </p>
              {entry.symptoms.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.symptoms.map(symptom => (
                    <span key={symptom} className="bg-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full">
                      {symptom}
                    </span>
                  ))}
                </div>
              )}
            </GlassPanel>
          ))
        ) : (
          <p className="text-center text-surface/70">No entries found. Try adjusting your search or filter.</p>
        )}
      </div>

      {editingEntry && (
        <Modal isOpen={!!editingEntry} onClose={() => setEditingEntry(null)} title="Edit Journal Entry">
          <form onSubmit={handleUpdateEntry} className="space-y-6">
            <Input 
              type="text"
              value={editingEntry.title}
              onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
              required
            />
            <textarea 
              value={editingEntry.content}
              onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
              className="w-full p-3 bg-white text-gray-900 rounded-lg h-48 prose"
            />
            <Input 
              type="text"
              value={editingEntry.symptoms.join(', ')}
              onChange={(e) => setEditingEntry({ ...editingEntry, symptoms: e.target.value.split(',').map(s => s.trim()) })}
            />
            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={() => setEditingEntry(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
