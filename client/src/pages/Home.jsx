import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Read. Swap. <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Repeat.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          Join the community of readers who exchange books they've finished for ones they want to read. No money involved, just a love for literature.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/browse" className="btn-primary text-lg px-8 py-3">
            Browse Books
          </Link>
          <Link to="/register" className="btn-outline text-lg px-8 py-3">
            Join the Club
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full">
        <FeatureCard 
          icon={<BookOpen size={32} className="text-primary" />}
          title="List Your Books"
          description="Upload books you've read and are willing to share with others."
        />
        <FeatureCard 
          icon={<RefreshCw size={32} className="text-secondary" />}
          title="Request a Swap"
          description="Find a book you want and offer one of yours in exchange."
        />
        <FeatureCard 
          icon={<Users size={32} className="text-purple-400" />}
          title="Connect & Chat"
          description="Once accepted, coordinate the exchange through real-time chat."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-8 text-left"
  >
    <div className="bg-glass w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

export default Home;
