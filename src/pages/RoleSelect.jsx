import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import useInterviewStore from '../store/interviewStore';
// Simple role icons

const RoleSelect = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { setCandidateData } = useInterviewStore();
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { id: 'electrician', emoji: '⚡', color: 'from-yellow-500 to-orange-500' },
    { id: 'plumber', emoji: '🔧', color: 'from-blue-500 to-cyan-500' },
    { id: 'welder', emoji: '🔥', color: 'from-red-500 to-pink-500' },
    { id: 'carpenter', emoji: '🔨', color: 'from-amber-600 to-yellow-600' },
    { id: 'mason', emoji: '🧱', color: 'from-gray-500 to-slate-600' },
    { id: 'painter', emoji: '🎨', color: 'from-purple-500 to-indigo-500' },
    { id: 'other', emoji: '🛠️', color: 'from-teal-500 to-cyan-600' }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleNext = () => {
    if (selectedRole) {
      setCandidateData({ role: selectedRole });
      navigate('/photo-capture');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t('role_heading')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {roles.map((role, index) => {
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRoleSelect(role.id)}
                className={`relative p-6 rounded-2xl bg-dark-card border-4 transition-all duration-300 ${
                  isSelected
                    ? 'border-primary shadow-lg shadow-primary/50'
                    : 'border-transparent hover:border-gray-600'
                }`}
                >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center text-4xl`}>
                  {role.emoji}
                </div>
                <p className="text-white font-semibold text-lg text-center">
                  {t(role.id)}
                </p>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {selectedRole && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full max-w-md mx-auto block py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-primary/50 transition-all"
          >
            {t('next_button')}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default RoleSelect;
