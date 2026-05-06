import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAdminStore from '../../store/adminStore';

const CATEGORY_COLORS = {
  job_ready: 'bg-green-100 text-green-800',
  needs_training: 'bg-yellow-100 text-yellow-800',
  requires_verification: 'bg-blue-100 text-blue-800',
  low_quality: 'bg-gray-100 text-gray-800',
  suspected_fraud: 'bg-red-100 text-red-800'
};

const CATEGORY_LABELS = {
  job_ready: '✅ Job Ready',
  needs_training: '📚 Needs Training',
  requires_verification: '🔍 Verify',
  low_quality: '⚠️ Low Quality',
  suspected_fraud: '🚨 Fraud'
};

const STATUS_COLORS = {
  pending_review: 'bg-gray-100 text-gray-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  flagged: 'bg-orange-100 text-orange-700'
};

const DISTRICTS = [
  'Bengaluru Urban','Bengaluru Rural','Mysuru','Mangaluru','Hubballi Dharwad',
  'Belagavi','Kalaburagi','Shivamogga','Tumakuru','Udupi','Hassan'
];

const ROLES = ['electrician','plumber','welder','carpenter','mason','painter','other'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, adminName, candidates, stats, fetchCandidates, fetchStats, updateStatus, logout } = useAdminStore();

  const [filters, setFilters] = useState({ district: '', role: '', language: '', category: '', search: '' });
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchStats();
    fetchCandidates();
  }, [token]);

  const handleFilter = (key, val) => {
    const newFilters = { ...filters, [key]: val };
    setFilters(newFilters);
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    fetchCandidates(params);
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'score') {
      aVal = a.assessment?.overall_score || 0;
      bVal = b.assessment?.overall_score || 0;
    } else if (sortBy === 'name') {
      aVal = a.name || '';
      bVal = b.name || '';
    } else if (sortBy === 'date') {
      aVal = a.created_at || '';
      bVal = b.created_at || '';
    }
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const handleBulkAction = async (action) => {
    for (const id of selected) {
      await updateStatus(id, action);
    }
    setSelected([]);
  };

  const exportCSV = () => {
    const headers = ['Name','Phone','District','Role','Language','Score','Category','Status'];
    const rows = sortedCandidates.map(c => [
      c.name, c.phone, c.district, c.applied_role, c.preferred_language,
      c.assessment?.overall_score || 'N/A',
      c.assessment?.category || 'pending',
      c.assessment?.final_status || 'pending_review'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'candidates.csv'; a.click();
  };

  const StatCard = ({ label, value, color, icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${color}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">AI SkillFit Admin</h1>
              <p className="text-xs text-gray-500">Karnataka Workforce Assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">👤 {adminName}</span>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              📊 Analytics
            </button>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <StatCard label="Total" value={stats.total_candidates} color="border-indigo-500" icon="👥" />
            <StatCard label="Job Ready" value={stats.job_ready} color="border-green-500" icon="✅" />
            <StatCard label="Training" value={stats.needs_training} color="border-yellow-500" icon="📚" />
            <StatCard label="Verify" value={stats.requires_verification} color="border-blue-500" icon="🔍" />
            <StatCard label="Low Quality" value={stats.low_quality} color="border-gray-400" icon="⚠️" />
            <StatCard label="Fraud" value={stats.suspected_fraud} color="border-red-500" icon="🚨" />
            <StatCard label="Shortlisted" value={stats.shortlisted} color="border-purple-500" icon="⭐" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input
              placeholder="🔍 Search name or phone"
              value={filters.search}
              onChange={e => handleFilter('search', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 col-span-2 md:col-span-1"
            />
            <select value={filters.district} onChange={e => handleFilter('district', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.role} onChange={e => handleFilter('role', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <select value={filters.language} onChange={e => handleFilter('language', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">All Languages</option>
              <option value="kannada">ಕನ್ನಡ</option>
              <option value="hindi">हिंदी</option>
              <option value="english">English</option>
            </select>
            <select value={filters.category} onChange={e => handleFilter('category', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">All Categories</option>
              <option value="job_ready">✅ Job Ready</option>
              <option value="needs_training">📚 Needs Training</option>
              <option value="requires_verification">🔍 Verify</option>
              <option value="low_quality">⚠️ Low Quality</option>
              <option value="suspected_fraud">🚨 Fraud</option>
            </select>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{sortedCandidates.length} candidates</span>
            {selected.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => handleBulkAction('shortlisted')}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200">
                  ✅ Shortlist ({selected.length})
                </button>
                <button onClick={() => handleBulkAction('rejected')}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">
                  ❌ Reject ({selected.length})
                </button>
              </div>
            )}
          </div>
          <button onClick={exportCSV}
            className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 font-medium">
            ⬇️ Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox"
                      onChange={e => setSelected(e.target.checked ? sortedCandidates.map(c => c.id) : [])}
                      checked={selected.length === sortedCandidates.length && sortedCandidates.length > 0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Candidate</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium cursor-pointer hover:text-indigo-600"
                    onClick={() => handleSort('score')}>
                    Score {sortBy === 'score' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Role</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">District</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Language</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      No candidates found. Run the demo data seeder to populate.
                    </td>
                  </tr>
                ) : sortedCandidates.map(c => {
                  const assessment = c.assessment || {};
                  const score = assessment.overall_score;
                  const category = assessment.category || 'pending';
                  const status = assessment.final_status || 'pending_review';
                  const fraudFlags = assessment.fraud_flags || [];

                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox"
                          checked={selected.includes(c.id)}
                          onChange={e => setSelected(prev =>
                            e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id)
                          )}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.photo_url ? (
                            <img src={`http://localhost:8000${c.photo_url}`} alt={c.name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {c.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {score != null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${score >= 7.5 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${score * 10}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-900">{score.toFixed(1)}</span>
                          </div>
                        ) : <span className="text-gray-400 text-xs">Pending</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600'}`}>
                          {CATEGORY_LABELS[category] || category}
                        </span>
                        {fraudFlags.length > 0 && (
                          <span className="ml-1 text-red-500 text-xs" title={fraudFlags.join(', ')}>🚩</span>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700">{c.applied_role}</td>
                      <td className="px-4 py-3 text-gray-700">{c.district}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs">
                          {c.preferred_language === 'kannada' ? '🇮🇳 ಕನ್ನಡ' :
                           c.preferred_language === 'hindi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate(`/admin/candidate/${c.id}`)}
                            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => updateStatus(c.id, 'shortlisted')}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => updateStatus(c.id, 'rejected')}
                            className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100"
                          >
                            ❌
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
