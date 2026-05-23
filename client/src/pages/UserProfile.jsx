// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Award, 
  Star, 
  Edit2,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Video,
  Globe,
  Code,
  ExternalLink,
  ThumbsUp,
  Share2,
  Briefcase
} from 'lucide-react';

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teach');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Cover Image with Gradient */}
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="relative px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <User className="text-white" size={48} />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <Edit2 size={16} className="text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                {profile?.isVerified && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> Verified Teacher
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star size={14} /> {profile?.rating || 4.8} ★
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail size={16} />
                  <span>{profile?.email}</span>
                </div>
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {profile?.bio && (
                <p className="mt-3 text-gray-600 max-w-2xl">{profile.bio}</p>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => navigate('/edit-profile')}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 px-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Teaching Hours</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.teachingHours || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Learning Hours</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.learningHours || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Skills Exchanged</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.skillsExchanged || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.totalSessions || 0}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="text-orange-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(profile?.linkedin || profile?.github || profile?.website) && (
          <div className="px-6 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Connect with Me</h3>
              <div className="flex flex-wrap gap-4">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                    <Globe size={18} /> Portfolio
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <ExternalLink size={18} /> LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <Code size={18} /> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8 px-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('teach')}
                className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === 'teach' 
                    ? 'text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Skills I Teach ({profile?.teachSkills?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('learn')}
                className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === 'learn' 
                    ? 'text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Skills I Learn ({profile?.learnSkills?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === 'badges' 
                    ? 'text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Badges & Awards ({profile?.badges?.length || 0})
              </button>
            </div>
          </div>

          {/* Skills I Teach Tab */}
          {activeTab === 'teach' && (
            <div className="mt-6">
              {profile?.teachSkills?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.teachSkills.map((skill, index) => (
                    <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg text-gray-900">{skill.name}</h3>
                            {skill.verified ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle size={12} /> Verified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs flex items-center gap-1">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{skill.experience} years of experience</p>
                          {skill.description && (
                            <p className="text-sm text-gray-600 mt-2">{skill.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-gray-400">
                              {skill.totalStudents || 0} students taught
                            </span>
                            <span className="text-xs text-gray-400">
                              ★ {skill.rating || 0} rating
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No skills added yet</h3>
                  <p className="mt-1 text-gray-500">Start teaching by adding your skills</p>
                  <button
                    onClick={() => navigate('/add-skill')}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                  >
                    Add Skill to Teach
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Skills I Learn Tab */}
          {activeTab === 'learn' && (
            <div className="mt-6">
              {profile?.learnSkills?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.learnSkills.map((skill, index) => (
                    <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-lg text-gray-900">{skill.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Interest level: {'⭐'.repeat(skill.interest || 3)}</p>
                      {skill.goal && (
                        <p className="text-sm text-gray-600 mt-2">Goal: {skill.goal}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No learning goals set</h3>
                  <p className="mt-1 text-gray-500">Update your profile to add skills you want to learn</p>
                </div>
              )}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="mt-6">
              {profile?.badges?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.badges.map((badge, index) => (
                    <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-3">
                        <Award className="text-white" size={32} />
                      </div>
                      <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
                      <p className="text-xs text-gray-400 mt-2">Earned: {new Date(badge.earnedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No badges yet</h3>
                  <p className="mt-1 text-gray-500">Complete sessions and get verified to earn badges</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;