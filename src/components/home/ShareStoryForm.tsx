
import { useState } from 'react';
import { Button, Input, Textarea, GlassPanel } from '../ui';

export default function ShareStoryForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [story, setStory] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [anonymousConsent, setAnonymousConsent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipient = 'hello@chiarivoices.org';
    const subject = 'New Story Submission from ' + name;
    const body = `
      New story submitted through the blog:

      Name: ${name}
      Email: ${email}
      Story:
      ${story}

      ---
      Permissions:
      Marketing Consent: ${marketingConsent ? 'Yes' : 'No'}
      Remain Anonymous: ${anonymousConsent ? 'Yes' : 'No'}
    `;
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailtoLink, '_blank');

    setIsSubmitted(true);
    // Reset form
    setName('');
    setEmail('');
    setStory('');
    setMarketingConsent(false);
    setAnonymousConsent(false);
  };

  return (
    <GlassPanel className="p-8 md:p-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-wide">Share Your Journey</h2>
        <p className="text-lg md:text-xl text-surface/70 mt-8">
          Your voice has power. Sharing your experience helps validate others and builds the evidence we need to advocate for change.
        </p>
      </div>
      <div className="mt-12 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Textarea
              label="Your Story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={8}
              maxLength={1800}
              placeholder="Tell us about your diagnosis, your struggles, or your triumphs..."
              required
            />
            <p className="mt-2 text-xs text-surface/50 text-right">Max 1800 characters</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                id="marketing-consent"
                type="checkbox"
                className="h-4 w-4 mt-1 text-accent bg-surface/20 border-accent/30 rounded focus:ring-accent"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                required
              />
              <label htmlFor="marketing-consent" className="ml-3 text-sm text-surface/70">
                I acknowledge that The Chiari Voices Foundation may use my story in marketing materials.
              </label>
            </div>
            <div className="flex items-start">
              <input
                id="anonymous-consent"
                type="checkbox"
                className="h-4 w-4 mt-1 text-accent bg-surface/20 border-accent/30 rounded focus:ring-accent"
                checked={anonymousConsent}
                onChange={(e) => setAnonymousConsent(e.target.checked)}
              />
              <label htmlFor="anonymous-consent" className="ml-3 text-sm text-surface/70">
                I want to be kept anonymous.
              </label>
            </div>
          </div>
          <div className="pt-4 text-center">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Submit Story
            </Button>
            {isSubmitted && (
              <div className="mt-4 text-green-400 text-center font-medium">
                Thank you for sharing! Your email client is opening to send your story.
              </div>
            )}
          </div>
        </form>
      </div>
    </GlassPanel>
  );
}
