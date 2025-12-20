import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui';

const commonSymptoms = [
  'Headache',
  'Neck Pain',
  'Dizziness',
  'Nausea',
  'Fatigue',
  'Tinnitus',
  'Brain Fog',
  'Visual Disturbances',
  'Numbness/Tingling',
];

interface SymptomTrackerProps {
  onSave: (symptoms: {symptoms: string[], painLevel: number, notes: string, timestamp: string}) => void;
  isSaving: boolean;
}

export function SymptomTracker({ onSave, isSaving }: SymptomTrackerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    onSave({
      symptoms: selectedSymptoms,
      painLevel,
      notes,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Symptoms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Common Symptoms</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonSymptoms.map(symptom => (
              <Button
                key={symptom}
                variant={selectedSymptoms.includes(symptom) ? 'secondary' : 'outline'}
                onClick={() => handleSymptomToggle(symptom)}
                className="w-full justify-start text-left h-auto py-2"
              >
                {symptom}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Pain Level: {painLevel}</h4>
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={e => setPainLevel(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <h4 className="font-semibold mb-2">Notes</h4>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-2 rounded bg-background border border-surface/20"
            rows={4}
            placeholder="Any additional details..."
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Symptom Log'}
        </Button>
      </CardContent>
    </Card>
  );
}
