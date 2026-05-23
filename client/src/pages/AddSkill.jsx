// src/pages/AddSkill.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  BookOpen, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Info,
  ArrowLeft,
  Trash2,
  Award,
  GraduationCap,
  Users
} from 'lucide-react';

const AddSkill = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [skillType, setSkillType] = useState('teach'); // 'teach' or 'learn'
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    experience: '',
    description: '',
    proficiency: 'intermediate',
    interest: 3,
    goal: '',
    resources: []
  });

  const categories = [
    'Programming & Development',
    'Design & Creative',
    'Business & Marketing',
    'Language Learning',
    'Music & Arts',
    'Photography & Video',
    'Health & Fitness',
    'Academic Tutoring',
    'Data Science & AI',
    'Digital Marketing',
    'Personal Development',
    'Other'
  ];

  const proficiencyLevels = [
    { value: 'beginner', label: 'Beginner (0-1 years)' },
    { value: 'intermediate', label: 'Intermediate (1-3 years)' },
    { value: 'advanced', label: 'Advanced (3-5 years)' },
    { value: 'expert', label: 'Expert (5+ years)' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a skill name' });
      return;
    }
    
    if (!formData.category) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return;
    }
    
    if (skillType === 'teach' && !formData.experience) {
      setMessage({ type: 'error', text: 'Please enter your years of experience' });
      return;
    }
    
    if (skillType === 'learn' && !formData.interest) {
      setMessage({ type: 'error', text: 'Please select your interest level' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = skillType === 'teach' 
        ? `${API_URL}/api/users/add-teach-skill`
        : `${API_URL}/api/users/add-learn-skill`;
      
      await axios.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ 
        type: 'success', 
        text: skillType === 'teach' 
          ? 'Skill added successfully! It will be reviewed for verification.' 
          : 'Learning goal added successfully!' 
      });
      
      // Reset form after 2 seconds and redirect
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding skill:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add skill. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition"
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Skill</h1>
          <p className="text-gray-600 mt-2">Share your expertise or set learning goals</p>
        </div>

        {/* Skill Type Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSkillType('teach')}
              className={`flex-1 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
                skillType === 'teach'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookOpen size={20} />
              <span className="font-semibold">I Want to Teach</span>
            </button>
            <button
              type="button"
              onClick={() => setSkillType('learn')}
              className={`flex-1 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
                skillType === 'learn'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GraduationCap size={20} />
              <span className="font-semibold">I Want to Learn</span>
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {skillType === 'teach' ? 'Skill Details' : 'Learning Goal Details'}
            </h2>
            
            <div className="space-y-5">
              {/* Skill Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {skillType === 'teach' ? 'Skill Name *' : 'What do you want to learn? *'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={skillType === 'teach' ? "e.g., JavaScript, Graphic Design, Python" : "e.g., React, Spanish, Digital Marketing"}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Teaching Specific Fields */}
              {skillType === 'teach' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        placeholder="e.g., 2.5"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
                      <select
                        name="proficiency"
                        value={formData.proficiency}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                      >
                        {proficiencyLevels.map((level, index) => (
                          <option key={index} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe what you can teach, your teaching style, and what students can expect..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
                    />
                  </div>
                </>
              )}

              {/* Learning Specific Fields */}
              {skillType === 'learn' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interest Level *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, interest: level })}
                          className={`flex-1 py-2 rounded-lg transition-all ${
                            formData.interest >= level
                              ? 'bg-yellow-400 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {level} ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Learning Goal</label>
                    <textarea
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      rows="3"
                      placeholder="What do you hope to achieve by learning this skill? What's your timeline?"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info Box for Teaching */}
          {skillType === 'teach' && (
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Skill Verification Process</p>
                <p>After adding your skill, you'll need to complete the AI verification process to get a "Verified" badge. This helps build trust in the community.</p>
              </div>
            </div>
          )}

          {/* Info Box for Learning */}
          {skillType === 'learn' && (
            <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
              <Users className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Find Your Match</p>
                <p>Once you add your learning goals, our smart matching system will connect you with verified teachers who can help you achieve them.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Plus size={18} />
              )}
              {loading ? 'Adding...' : 'Add Skill'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award size={18} className="text-purple-600" />
            Pro Tips for Better Matches
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Be specific about your skill level - it helps find the right matches</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Add a detailed description to attract more learning/teaching partners</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Complete the AI verification to get a trust badge on your profile</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>You can add multiple skills - both to teach and learn!</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default AddSkill;