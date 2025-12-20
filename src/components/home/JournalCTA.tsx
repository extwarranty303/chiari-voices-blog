import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { BookHeart } from 'lucide-react';
import { GlassPanel } from '../ui';
import journalImage from '../../assets/images/journal-symptom-tracker-illustration.png';

export default function JournalCTA() {
  return (
    <GlassPanel className="p-8 md:p-12 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-bold text-text mb-4">
            Track Your Journey, Find Your Patterns
          </h2>
          <p className="text-muted mb-6">
            Our new Journal and Symptom Tracker is a private space designed to help you document your health journey. Log symptoms, record thoughts, and uncover insights that can empower your conversations with healthcare providers.
          </p>
          <Button asChild size="lg" variant="primary">
            <Link to="/journal">
              <BookHeart size={20} className="mr-2" />
              Start Your Private Journal
            </Link>
          </Button>
        </div>
        <div className="order-1 md:order-2 h-64 md:h-full w-full overflow-hidden rounded-lg">
          <img 
            src={journalImage}
            alt="Journal and Symptom Tracker Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </GlassPanel>
  );
}
