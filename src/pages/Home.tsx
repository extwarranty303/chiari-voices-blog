import { Button } from '../components/ui';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <SEO 
        title="Home" 
        description="Welcome to the Chiari Voices community blog. A space dedicated to awareness, support, and the power of shared experiences for those with Chiari Malformation."
        keywords={["Chiari Malformation", "Chronic Illness", "Support Community", "Health Blog"]}
      />
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-surface/70">
          Amplifying Voices,<br />Sharing Stories
        </h1>
        <p className="text-xl md:text-2xl text-surface/80 leading-relaxed">
          Welcome to the Chiari Voices community blog. A space dedicated to awareness, support, and the power of shared experiences.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/blog">
            <Button size="lg" className="w-full sm:w-auto">Read the Blog</Button>
          </Link>
          <Link to="/login">
             <Button variant="secondary" size="lg" className="w-full sm:w-auto">Join the Community</Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative background elements could go here */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}
