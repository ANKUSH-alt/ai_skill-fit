import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import useInterviewStore from '../store/interviewStore';

const Registration = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { candidateData, setCandidateData } = useInterviewStore();

  const [formData, setFormData] = useState({
    name: candidateData.name || '',
    phone: candidateData.phone || '',
    district: candidateData.district || '',
    education: candidateData.education || '',
    experience: candidateData.experience || 0
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('error_required');
    if (!formData.phone.trim()) newErrors.phone = t('error_required');
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = t('error_invalid_phone');
    if (!formData.district) newErrors.district = t('error_required');
    if (!formData.education) newErrors.education = t('error_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setCandidateData(formData);
      navigate('/role-select');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('app_name')}</h1>
          <p className="text-gray-400">{t('tagline')}</p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-dark-card rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('registration_heading')}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">{t('name_label')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder={t('name_label')} />
              {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t('phone_label')}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="9876543210" />
              {errors.phone && <p className="text-danger text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t('district_label')}</label>
              <select name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all">
                <option value="">{t('select_district')}</option>
                {(t('districts') || []).map((district, index) => <option key={index} value={district}>{district}</option>)}
              </select>
              {errors.district && <p className="text-danger text-sm mt-1">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t('education_label')}</label>
              <select name="education" value={formData.education} onChange={handleChange} className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all">
                <option value="">{t('select_education')}</option>
                {(t('education_options') || []).map((edu, index) => <option key={index} value={edu}>{edu}</option>)}
              </select>
              {errors.education && <p className="text-danger text-sm mt-1">{errors.education}</p>}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t('experience_label')}</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" max="30" className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
            </div>

            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-primary/50 transition-all">
              {t('next_button')}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Registration;
