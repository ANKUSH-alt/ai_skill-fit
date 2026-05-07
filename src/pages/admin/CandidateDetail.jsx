import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import useAdminStore from '../../store/adminStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORY_COLORS = {
  job_ready: 'bg-green-100 text-green-900 border-green-300',
  needs_training: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  requires_verification: 'bg-blue-100 text-blue-900 border-blue-300',
  low_quality: 'bg-gray-200 text-gray-900 border-gray-400',
  suspected_fraud: 'bg-red-100 text-red-900 border-red-300'
};

const ScoreBar = ({ label, score, color = 'bg-indigo-500' }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{score?.toFixed(1) ?? 'N/A'}/10</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(score || 0) * 10}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-2.5 rounded-full ${color}`}
      />
    </div>
  </div>
);

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, updateStatus } = useAdminStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchDetail();
  }, [id, token]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    await updateStatus(id, status, note);
    fetchDetail();
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading candidate details...</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-red-500">Candidate not found</div>
    </div>
  );

  const { candidate, assessment, responses } = data;
  const category = assessment?.category || 'pending';
  const score = assessment?.overall_score;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')}
            className="text-gray-700 hover:text-gray-900 font-semibold">
            ← Back
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Candidate Review</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Candidate Info */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-4">
                {candidate.photo_url ? (
                  <img src={`${API}${candidate.photo_url}`} alt={candidate.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-indigo-100" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto text-3xl font-bold text-indigo-600">
                    {candidate.name?.charAt(0)}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mt-3">{candidate.name}</h2>
                <p className="text-gray-500">{candidate.phone}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${CATEGORY_COLORS[category]}`}>
                  {category.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  ['Role', candidate.applied_role],
                  ['District', candidate.district],
                  ['Language', candidate.preferred_language],
                  ['Education', candidate.education],
                  ['Experience', `${candidate.experience_years} years`],
                  ['Applied', new Date(candidate.created_at).toLocaleDateString()]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900 capitalize">{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Score */}
            {score != null && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold ${score >= 7.5 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {score.toFixed(1)}
                  </div>
                  <div className="text-gray-500 text-sm">Overall Score / 10</div>
                  <div className="mt-2 text-sm font-medium text-gray-700">
                    Job Readiness: {assessment.job_readiness_percentage}%
                  </div>
                </div>
                <ScoreBar label="Technical" score={assessment.technical_score} color="bg-indigo-500" />
                <ScoreBar label="Communication" score={assessment.communication_score} color="bg-blue-500" />
                <ScoreBar label="Confidence" score={assessment.confidence_score} color="bg-purple-500" />
                <ScoreBar label="Language" score={assessment.language_score} color="bg-green-500" />
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
              <textarea
                placeholder="Add recruiter notes..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => handleAction('shortlisted')}
                  className="bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
                  ✅ Shortlist
                </button>
                <button onClick={() => handleAction('rejected')}
                  className="bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
                  ❌ Reject
                </button>
                <button onClick={() => handleAction('flagged')}
                  className="bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700">
                  🚩 Flag
                </button>
                <button onClick={() => handleAction('pending_review')}
                  className="bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700">
                  ↩️ Reset
                </button>
              </div>
            </div>
          </div>

          {/* Center: Video + Responses */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Summary */}
            {assessment?.ai_summary && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Assessment Summary</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{assessment.ai_summary}</p>
                {assessment.recruiter_recommendation && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-800">
                    {assessment.recruiter_recommendation}
                  </div>
                )}
              </div>
            )}

            {/* Fraud Flags */}
            {assessment?.fraud_flags?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h3 className="font-semibold text-red-800 mb-2">🚨 Fraud Flags</h3>
                <ul className="space-y-1">
                  {assessment.fraud_flags.map((flag, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span>•</span> {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            {(assessment?.strengths?.length > 0 || assessment?.weaknesses?.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-green-800 mb-2">💪 Strengths</h3>
                  <ul className="space-y-1">
                    {(assessment.strengths || []).map((s, i) => (
                      <li key={i} className="text-sm text-green-700">✓ {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">📈 Areas to Improve</h3>
                  <ul className="space-y-1">
                    {(assessment.weaknesses || []).map((w, i) => (
                      <li key={i} className="text-sm text-yellow-700">• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Question Responses */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📋 Question Responses ({responses?.length || 0})</h3>
              {responses?.length === 0 ? (
                <p className="text-gray-400 text-sm">No responses recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {responses?.map((r, i) => {
                    const scores = r.ai_scores || {};
                    return (
                      <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            Q{i + 1} · {r.question_type}
                          </span>
                          <span className={`text-sm font-bold ${scores.overall >= 7 ? 'text-green-600' : scores.overall >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {scores.overall?.toFixed(1) ?? '—'}/10
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-2">{r.question_text}</p>

                        {r.video_url && (
                          <div className="mb-3">
                            {activeVideo === r.id ? (
                              <video
                                src={`${API}${r.video_url}`}
                                controls
                                className="w-full rounded-lg max-h-48"
                                autoPlay
                              />
                            ) : (
                              <button
                                onClick={() => setActiveVideo(r.id)}
                                className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg py-3 text-sm text-gray-600 flex items-center justify-center gap-2"
                              >
                                ▶️ Play Video Response
                              </button>
                            )}
                          </div>
                        )}

                        {r.transcript && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <p className="text-xs text-gray-500 mb-1">Transcript:</p>
                            <p className="text-sm text-gray-700">{r.transcript}</p>
                          </div>
                        )}

                        {Object.keys(scores).length > 0 && (
                          <div className="grid grid-cols-4 gap-2 text-center">
                            {[['Tech', scores.technical], ['Comm', scores.communication],
                              ['Conf', scores.confidence], ['Lang', scores.language]].map(([label, val]) => (
                              <div key={label} className="bg-gray-50 rounded-lg p-2">
                                <div className="text-xs text-gray-500">{label}</div>
                                <div className="font-semibold text-gray-900">{val?.toFixed(1) ?? '—'}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {r.red_flags?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {r.red_flags.map((flag, fi) => (
                              <span key={fi} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                                ⚠️ {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Training Recommendations */}
            {assessment?.training_recommendations?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">📚 Training Recommendations</h3>
                <div className="space-y-2">
                  {assessment.training_recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-500 mt-0.5">📖</span>
                      <div>
                        <p className="text-sm font-medium text-blue-900">{rec.gap}</p>
                        <p className="text-xs text-blue-700">{rec.resource} · {rec.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
