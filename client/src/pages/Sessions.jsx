import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(response.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-600 mt-2">View your scheduled and completed skill exchange sessions.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : sessions.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-600">You don't have any sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session._id || session.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{session.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">With: {session.withUser || 'Your match'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(session.date).toLocaleString()}</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${session.status === 'completed' ? 'bg-green-100 text-green-800' : session.status === 'canceled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {session.status || 'upcoming'}
                    </span>
                  </div>
                </div>
                {session.notes && <p className="mt-4 text-gray-600">{session.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
