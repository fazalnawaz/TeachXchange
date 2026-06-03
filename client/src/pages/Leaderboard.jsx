import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NEW: highest points value, used to scale the progress bars.
  // Leaders arrive already sorted by points (highest first) from the API.
  const maxPoints = Math.max(1, ...leaders.map((l) => l.points || 0));

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaders(response.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-2">See the most trusted teachers and top-rated peers in the community.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : leaders.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">No leaderboard data available yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm bg-white">
            {/* --- OLD header (Score bar based on rating + Rating only) ---
            <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-600">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Score</div>
              <div className="col-span-2 text-right">Rating</div>
            </div>
            --- end OLD header --- */}
            {/* NEW header: Points column added, layout = # | Name | Points | Rating */}
            <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-600">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Points</div>
              <div className="col-span-2 text-right">Rating</div>
            </div>
            <div className="divide-y divide-gray-100">
              {leaders.map((leader, index) => (
                <div key={leader._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm text-gray-800">
                  <div className="col-span-1 font-semibold">{index + 1}</div>
                  <div className="col-span-5">
                    <p className="font-medium text-gray-900">{leader.name}</p>
                    <p className="text-xs text-gray-500">{leader.location || 'Unknown location'}</p>
                  </div>
                  {/* --- OLD Points column: progress bar was based on rating (rating/5) ---
                  <div className="col-span-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                        style={{ width: `${Math.min(100, (leader.rating || 0) / 5 * 100)}%` }}
                      />
                    </div>
                  </div>
                  --- end OLD Points column --- */}
                  {/* NEW Points column: shows the points value + a bar scaled to the top scorer */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                          style={{ width: `${Math.min(100, ((leader.points || 0) / maxPoints) * 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 w-12 text-right">{leader.points || 0}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-gray-900 font-semibold">{(leader.rating || 0).toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
