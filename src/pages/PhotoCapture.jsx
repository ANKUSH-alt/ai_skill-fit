import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import useLanguage from '../hooks/useLanguage';
import useInterviewStore from '../store/interviewStore';
import useLanguageStore from '../store/languageStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PhotoCapture = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { candidateData, setCandidateData, setSession } = useInterviewStore();
  const { language } = useLanguageStore();
  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) { setPhoto(imageSrc); setError(''); }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(photo);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('photo', blob, 'photo.jpg');
      formData.append('name', candidateData.name || '');
      formData.append('phone', candidateData.phone || '');
      formData.append('district', candidateData.district || '');
      formData.append('role', candidateData.role || 'electrician');
      formData.append('language', language || 'kannada');
      formData.append('education', candidateData.education || '');
      formData.append('experience_years', String(candidateData.experience || 0));

      const response = await fetch(`${API}/api/candidate/register`, { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        if (data.detail === 'phone_exists') { setError(t('error_phone_exists')); return; }
        if (data.detail === 'face_exists') { setError(t('error_face_exists')); return; }
        if (data.detail === 'no_face_detected') { setError(t('error_no_face')); return; }
        setError(t('error_no_face'));
        return;
      }

      setCandidateData({ photo, candidateId: data.candidate_id });
      setSession(data.session_id, data.candidate_id);
      navigate('/instructions');
    } catch (err) {
      console.error(err);
      // Fallback: allow proceeding without backend for demo
      setCandidateData({ photo });
      setSession('demo-session-' + Date.now(), 'demo-candidate-' + Date.now());
      navigate('/instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('photo_heading')}</h2>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="bg-dark-card rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="mb-6 space-y-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center gap-3 text-gray-300">
                <span className="text-success text-xl">✓</span>
                <span>{t(`photo_tip${n}`)}</span>
              </div>
            ))}
          </div>
          <div className="relative aspect-[4/3] bg-dark rounded-2xl overflow-hidden mb-6">
            {!photo ? (
              <>
                <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover" mirrored={true} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 border-4 border-primary/50 rounded-full" />
                </div>
              </>
            ) : (
              <img src={photo} alt="Captured" className="w-full h-full object-cover" />
            )}
          </div>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 p-4 bg-danger/10 border border-danger rounded-xl flex items-center gap-3">
              <span className="text-danger text-2xl">⚠</span>
              <p className="text-danger">{error}</p>
            </motion.div>
          )}
          {isLoading && (
            <div className="mb-4 p-4 bg-info/10 border border-info rounded-xl text-center">
              <p className="text-info">{t('verifying')}</p>
            </div>
          )}
          <div className="space-y-3">
            {!photo ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={capturePhoto}
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-3">
                <span className="text-2xl">📷</span>{t('take_photo')}
              </motion.button>
            ) : (
              <>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm} disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-success to-green-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50">
                  {isLoading ? '...' : t('confirm_photo')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setPhoto(null); setError(''); }} disabled={isLoading}
                  className="w-full py-4 bg-gray-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-gray-700 transition-all disabled:opacity-50">
                  {t('retake')}
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PhotoCapture;
