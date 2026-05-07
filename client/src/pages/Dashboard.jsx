import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { motion } from 'framer-motion';
import { BookPlus, List, Send, Inbox, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user, api } = useAuth();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('my-books'); // my-books, add-book, requests
  
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);

  // New Book Form State
  const [newBook, setNewBook] = useState({
    title: '', author: '', category: 'Fiction', condition: 'Good', description: '', image: ''
  });

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      socket.on('new_exchange_request', (data) => {
        alert(`New Request: ${data.message}`);
        fetchDashboardData();
      });
      socket.on('exchange_status_updated', (data) => {
        alert(`Status Update: ${data.message}`);
        fetchDashboardData();
      });
    }

    return () => {
      if (socket) {
        socket.off('new_exchange_request');
        socket.off('exchange_status_updated');
      }
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [booksRes, requestsRes] = await Promise.all([
        api.get('/books/user/me'),
        api.get('/exchange/myrequests')
      ]);
      setMyBooks(booksRes.data);
      setRequests({
        sent: requestsRes.data.sentRequests,
        received: requestsRes.data.receivedRequests
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/books', newBook);
      setNewBook({ title: '', author: '', category: 'Fiction', condition: 'Good', description: '', image: '' });
      setActiveTab('my-books');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to add book', error);
      alert('Failed to add book');
    }
  };

  const handleUpdateStatus = async (exchangeId, status) => {
    try {
      await api.put(`/exchange/${exchangeId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update status', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-2 border-primary" />
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <div className="flex gap-4 mt-4">
            <div className="bg-dark-glass px-4 py-2 rounded-lg border border-glass-border">
              <span className="text-xl font-bold text-primary block">{myBooks.length}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Books Listed</span>
            </div>
            <div className="bg-dark-glass px-4 py-2 rounded-lg border border-glass-border">
              <span className="text-xl font-bold text-secondary block">{requests.received.length}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Requests Received</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-glass-border mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('my-books')}
          className={`pb-4 px-4 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'my-books' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <List size={18} /> My Library
        </button>
        <button 
          onClick={() => setActiveTab('add-book')}
          className={`pb-4 px-4 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'add-book' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <BookPlus size={18} /> List a Book
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`pb-4 px-4 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Inbox size={18} /> Exchange Requests
        </button>
      </div>

      {activeTab === 'my-books' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {myBooks.map(book => (
            <div key={book._id} className="glass-card p-4 flex gap-4 items-start">
              <img src={book.image} alt={book.title} className="w-20 h-28 object-cover rounded shadow" />
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{book.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{book.author}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${book.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {book.available ? 'Available' : 'Swapped'}
                </span>
              </div>
            </div>
          ))}
          {myBooks.length === 0 && <p className="col-span-full text-center text-gray-400 py-10">You haven't listed any books yet.</p>}
        </div>
      )}

      {activeTab === 'add-book' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">List a New Book</h2>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input required type="text" className="input-field" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Author</label>
                <input required type="text" className="input-field" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select className="input-field bg-dark" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}>
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Sci-Fi</option>
                  <option>Mystery</option>
                  <option>Biography</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Condition</label>
                <select className="input-field bg-dark" value={newBook.condition} onChange={e => setNewBook({...newBook, condition: e.target.value})}>
                  <option>New</option>
                  <option>Good</option>
                  <option>Old</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Image URL (optional)</label>
              <input type="text" className="input-field" value={newBook.image} onChange={e => setNewBook({...newBook, image: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea required rows="4" className="input-field" value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})}></textarea>
            </div>

            <button type="submit" className="btn-primary w-full py-3">List Book for Swap</button>
          </form>
        </motion.div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Inbox className="text-secondary"/> Received Requests</h3>
            <div className="space-y-4">
              {requests.received.map(req => (
                <div key={req._id} className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <p className="mb-2"><span className="font-bold text-secondary">{req.senderId.name}</span> wants to swap for your <span className="font-bold text-white">{req.requestedBookId.title}</span></p>
                    <p className="text-sm text-gray-400">They are offering: <span className="text-primary font-medium">{req.offeredBookId.title}</span></p>
                  </div>
                  <div className="flex gap-3">
                    {req.status === 'Pending' ? (
                      <>
                        <button onClick={() => handleUpdateStatus(req._id, 'Accepted')} className="btn-primary !px-4 !py-1 text-sm bg-gradient-to-r from-green-500 to-emerald-600">Accept</button>
                        <button onClick={() => handleUpdateStatus(req._id, 'Rejected')} className="btn-outline !px-4 !py-1 text-sm border-red-500/50 hover:bg-red-500/10 text-red-400">Reject</button>
                      </>
                    ) : (
                      <span className={`px-4 py-1 rounded-full text-sm ${req.status === 'Accepted' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {requests.received.length === 0 && <p className="text-gray-400">No received requests.</p>}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Send className="text-primary"/> Sent Requests</h3>
            <div className="space-y-4">
              {requests.sent.map(req => (
                <div key={req._id} className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <p className="mb-2">You requested <span className="font-bold text-white">{req.requestedBookId.title}</span> from <span className="font-bold text-primary">{req.receiverId.name}</span></p>
                    <p className="text-sm text-gray-400">Offering: <span className="font-medium text-gray-300">{req.offeredBookId.title}</span></p>
                  </div>
                  <div>
                    <span className={`px-4 py-1 rounded-full text-sm ${
                      req.status === 'Accepted' ? 'bg-green-500/20 text-green-300' : 
                      req.status === 'Rejected' ? 'bg-red-500/20 text-red-300' : 
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
              {requests.sent.length === 0 && <p className="text-gray-400">No sent requests.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
