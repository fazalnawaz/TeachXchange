import React, { useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';

export default function Browse() {
  const [technology, setTechnology] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!technology.trim()) {
      setMessage('Please enter a technology to search.');
      setResults([]);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          technology: technology.trim(),
        },
      });

      setResults(response.data);
      if (response.data.length === 0) {
        setMessage(`No users found for "${technology.trim()}".`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Match</h1>
          <p className="text-gray-600 mt-2">
            Enter a technology or skill to find tutors and learners offering it.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              placeholder="Search technology, e.g. React, Python, Graphic Design"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>

        {results.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {results.map((user) => (
              <div key={user._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    {user.role || 'teacher'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{user.bio || 'No profile description available.'}</p>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                    <span className="font-medium">Rating</span>
                    <span>{user.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                    <span className="font-medium">Location</span>
                    <span>{user.location || 'Worldwide'}</span>
                  </div>
                </div>

                {user.skills?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Matching Skills</h3>
                    <div className="space-y-2">
                      {user.skills.slice(0, 3).map((skill) => (
                        <div key={skill._id || skill.name} className="rounded-2xl border border-gray-200 p-3 bg-gray-50">
                          <p className="font-medium text-gray-900">{skill.name}</p>
                          <p className="text-xs text-gray-600">{skill.category} • {skill.proficiency || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
