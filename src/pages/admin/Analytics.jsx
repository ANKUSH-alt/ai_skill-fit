import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import useAdminStore from '../../store/adminStore';

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#6B7280', '#EF4444'];

const Analytics = () => {
  const navigate = useNavigate();
  const { token, analytics, fetchAnalytics } = useAdminStore();

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchAnalytics();
  }, [token]);

  if (!analytics) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading analytics...</div>
    </div>
  );

  const categoryData = Object.entries(analytics.category_distribution || {}).map(([k, v]) => ({
    name: k.replace('_', ' '), value: v
  }));

  const languageData = Object.entries(analytics.language_distribution || {}).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v
  }));

  const scoreData = Object.entries(analytics.score_distribution || {}).map(([k, v]) => ({
    range: k, count: v
  }));

  const districtData = Object.entries(analytics.district_distribution || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([k, v]) => ({ district: k.split(' ')[0], count: v }));

  const roleData = Object.entries(analytics.role_distribution || {}).map(([k, v]) => ({
    role: k.charAt(0).toUpperCase() + k.slice(1), count: v
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')} className="text-gray-500 hover:text-gray-700">
            ← Dashboard
          </button>
          <h1 className="font-bold text-gray-900">📊 Analytics</h1>
          <span className="text-sm text-gray-500">Total: {analytics.total_candidates} candidates</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Fitment Categories</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Language Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Language Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={languageData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreData}>
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* District Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Districts</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={districtData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="district" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Role Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm col-span-full p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Candidates by Role</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roleData}>
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
