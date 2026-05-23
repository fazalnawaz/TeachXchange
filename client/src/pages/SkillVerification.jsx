// src/pages/SkillVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Upload,
  FileText,
  Video,
  Link as LinkIcon,
  Brain,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';

const SkillVerification = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [verificationMethod, setVerificationMethod] = useState('quiz');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetchUnverifiedSkills();
  }, []);

  const fetchUnverifiedSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/unverified-skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!selectedSkill) {
      setMessage({ type: 'error', text: 'Please select a skill to verify' });
      return;
    }

    setVerifying(true);
    setMessage({ type: '', text: '' });
    setVerificationResult(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('skillId', selectedSkill._id);
      formData.append('method', verificationMethod);
      
      if (verificationMethod === 'quiz' && quizAnswers[selectedSkill._id]) {
        formData.append('answers', JSON.stringify(quizAnswers[selectedSkill._id]));
      }
      
      if (verificationMethod === 'project' && uploadedFile) {
        formData.append('projectFile', uploadedFile);
      }

      const response = await axios.post(`${API_URL}/api/users/verify-skill`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const result = response.data;
      setVerificationResult(result);
      
      if (result.score >= 70) {
        setMessage({ type: 'success', text: `Congratulations! Your skill has been verified with ${result.score}% score!` });
      } else {
        setMessage({ type: 'error', text: `Verification failed. Score: ${result.score}%. Minimum required: 70%. Please try again.` });
      }
      
      // Refresh skills list
      fetchUnverifiedSkills();
      
    } catch (error) {
      console.error('Error verifying skill:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Verification failed. Please try again.' });
    } finally {
      setVerifying(false);
    }
  };

  const sampleQuiz = {
    question1: "What is the best practice for writing clean code?",
    question2: "How do you handle errors in production?",
    question3: "Describe your approach to problem-solving"
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
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition"
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Skill Verification</h1>
          <p className="text-gray-600 mt-2">Verify your skills to earn trust badges and unlock more opportunities</p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-8 border border-purple-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">How Verification Works</h2>
              <p className="text-gray-600 mt-1">Our AI system evaluates your skills through multiple methods. You need to score 70% or above to get verified.</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>AI-powered assessment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Multiple verification methods</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Instant results</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unverified Skills List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Ready for Verification</h2>
          {skills.filter(s => !s.verified).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <Award className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No skills to verify</h3>
              <p className="text-gray-500 mt-2">Add a skill first, then come back here to get it verified</p>
              <button
                onClick={() => navigate('/add-skill')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Add a Skill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.filter(s => !s.verified).map((skill) => (
                <div
                  key={skill._id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${
                    selectedSkill?._id === skill._id
                      ? 'border-purple-500 shadow-md'
                      : 'border-gray-100 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{skill.name}</h3>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs flex items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{skill.experience} years experience</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{skill.description}</p>
                    </div>
                    {selectedSkill?._id === skill._id && (
                      <CheckCircle className="text-purple-600" size={24} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Form */}
        {selectedSkill && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Verify: {selectedSkill.name}
            </h2>

            {/* Verification Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Verification Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationMethod('quiz')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    verificationMethod === 'quiz'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <FileText className={`mx-auto mb-2 ${verificationMethod === 'quiz' ? 'text-purple-600' : 'text-gray-400'}`} size={24} />
                  <p className="font-medium text-sm">AI Quiz</p>
                  <p className="text-xs text-gray-500 mt-1">Multiple choice questions</p>
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod('project')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    verificationMethod === 'project'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Upload className={`mx-auto mb-2 ${verificationMethod === 'project' ? 'text-purple-600' : 'text-gray-400'}`} size={24} />
                  <p className="font-medium text-sm">Project Submission</p>
                  <p className="text-xs text-gray-500 mt-1">Upload your work</p>
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod('interview')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    verificationMethod === 'interview'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Video className={`mx-auto mb-2 ${verificationMethod === 'interview' ? 'text-purple-600' : 'text-gray-400'}`} size={24} />
                  <p className="font-medium text-sm">Live Interview</p>
                  <p className="text-xs text-gray-500 mt-1">Schedule with AI</p>
                </button>
              </div>
            </div>

            {/* Quiz Method */}
            {verificationMethod === 'quiz' && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-gray-900">Sample Assessment Questions</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-900 mb-2">1. {sampleQuiz.question1}</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="q1" className="text-purple-600" />
                        <span className="text-sm text-gray-700">Write complex code to show expertise</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="q1" className="text-purple-600" />
                        <span className="text-sm text-gray-700">Keep it simple, readable, and maintainable</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="q1" className="text-purple-600" />
                        <span className="text-sm text-gray-700">Focus only on functionality</span>
                      </label>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-900 mb-2">2. {sampleQuiz.question2}</p>
                    <textarea
                      placeholder="Write your answer here..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Project Submission Method */}
            {verificationMethod === 'project' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Upload Your Project/Portfolio</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition">
                  <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-sm text-gray-600 mb-2">Click or drag and drop to upload</p>
                  <p className="text-xs text-gray-500">PDF, ZIP, or image files (Max 10MB)</p>
                  <input type="file" className="hidden" id="fileUpload" />
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileUpload').click()}
                    className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {/* Live Interview Method */}
            {verificationMethod === 'interview' && (
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="text-purple-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Schedule AI Interview</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">The AI will conduct a 15-minute interview to assess your expertise in {selectedSkill.name}.</p>
                <div className="flex gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Today, 2:00 PM</option>
                    <option>Today, 4:00 PM</option>
                    <option>Tomorrow, 10:00 AM</option>
                    <option>Tomorrow, 2:00 PM</option>
                  </select>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition">
                    Schedule Interview
                  </button>
                </div>
              </div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <div className={`mb-6 p-4 rounded-xl ${
                verificationResult.score >= 70
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  {verificationResult.score >= 70 ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      verificationResult.score >= 70 ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Verification Result: {verificationResult.score}%
                    </h3>
                    <p className={`text-sm ${
                      verificationResult.score >= 70 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {verificationResult.score >= 70 
                        ? 'Congratulations! Your skill has been verified.' 
                        : 'Score below 70%. Please review the material and try again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Display */}
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleVerification}
                disabled={verifying}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Award size={18} />
                )}
                {verifying ? 'Verifying...' : 'Start Verification'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Verified Skills</p>
                <p className="text-2xl font-bold text-gray-900">{skills.filter(s => s.verified).length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">{skills.filter(s => !s.verified).length}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Trust Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((skills.filter(s => s.verified).length / (skills.length || 1)) * 100)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SkillVerification;