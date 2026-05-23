import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load messages.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Communicate with your matches and stay on top of your learning exchanges.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : messages.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">No messages yet. Start a conversation by finding a match.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message._id || message.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{message.from}</h2>
                    <p className="text-sm text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${message.read ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {message.read ? 'Read' : 'New'}
                  </span>
                </div>
                <p className="text-gray-600">{message.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
