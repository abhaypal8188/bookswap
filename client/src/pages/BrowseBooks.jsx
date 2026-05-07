import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen } from 'lucide-react';

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { api, user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, [category]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/books?keyword=${keyword}&category=${category}`);
      setBooks(data);
    } catch (error) {
      console.error('Failed to fetch books', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const requestExchange = async (requestedBookId) => {
    // Basic implementation for now - in reality this would open a modal to select which book to offer
    alert('Exchange request feature will open a modal to select your book to offer.');
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-4xl font-bold">Discover Books</h1>
        
        <form onSubmit={handleSearch} className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="input-field pl-10"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary flex items-center justify-center">
            Search
          </button>
        </form>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Biography'].map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat === 'All' ? '' : cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              (category === cat || (category === '' && cat === 'All'))
                ? 'bg-primary text-white' 
                : 'bg-glass border border-glass-border hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={book._id} 
              className="glass-card overflow-hidden flex flex-col group"
            >
              <div className="relative h-64 overflow-hidden bg-dark-glass">
                <img 
                  src={book.image} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                  {book.condition}
                </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <p className="text-primary text-sm font-medium mb-1">{book.category}</p>
                <h3 className="text-xl font-bold mb-1 truncate" title={book.title}>{book.title}</h3>
                <p className="text-gray-400 text-sm mb-4">by {book.author}</p>
                
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-glass-border">
                  <img src={book.ownerId.avatar} alt="Owner" className="w-6 h-6 rounded-full" />
                  <span className="text-sm text-gray-300 truncate">{book.ownerId.name}</span>
                </div>
                
                {user && user._id !== book.ownerId._id && (
                  <button 
                    onClick={() => requestExchange(book._id)}
                    className="w-full mt-4 bg-white/5 hover:bg-primary/20 border border-primary/30 text-primary py-2 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <BookOpen size={16} /> Request Swap
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {books.length === 0 && (
             <div className="col-span-full text-center py-20 text-gray-400 text-lg">
                No books found matching your criteria.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseBooks;
