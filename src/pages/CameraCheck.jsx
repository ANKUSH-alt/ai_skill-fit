import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import useLanguage from '../hooks/useLanguage';
// Simple icons with emojis

const CameraCheck = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [checks, setChecks] = useState({
    camera: false,
    microphone: false,
    face: false,
    lighting: false
  });

  useEffect(() => {
    // Simulate camera and mic check
    const timer = setTimeout(() => {
      setChecks(prev => ({ ...prev, camera: true, microphone: true }));
    }, 1000);

    // Simulate face detection
    const faceTimer = setTimeout(() => {
      setChecks(prev => ({ ...prev, face: true }));
    }, 2000);

    // Simulate lighting check
    const lightTimer = setTimeout(() => {
      setChecks(prev => ({ ...prev, lighting: true }));
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(faceTimer);
      clearTimeout(lightTimer);
    };
  }, []);

  const allChecksPassed = Object.values(checks).every(check => check);

  const checkItems = [
    { key: 'camera', emoji: '📷', label: 'camera_ready', warning: 'warning_camera' },
    { key: 'microphone', emoji: '🎤', label: 'mic_ready', warning: 'warning_mic' },
    { key: 'face', emoji: '👤', label: 'face_detected', warning: 'warning_face' },
    { key: 'lighting', emoji: '💡', label: 'light_good', warning: 'warning_dark' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t('camera_heading')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Camera Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-card rounded-3xl shadow-2xl p-6"
          >
            <div className="aspect-[4/3] bg-dark rounded-2xl overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                className="w-full h-full object-cover"
                mirrored={true}
              />
            </div>
          </motion.div>

          {/* Checks List */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-card rounded-3xl shadow-2xl p-6 flex flex-col"
          >
            <div className="space-y-4 flex-1">
              {checkItems.map((item, index) => {
                const passed = checks[item.key];
                
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      passed
                        ? 'bg-success/10 border-success'
                        : 'bg-warning/10 border-warning'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      passed ? 'bg-success' : 'bg-warning'
                    }`}>
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${passed ? 'text-success' : 'text-warning'}`}>
                        {passed ? t(item.label) : t(item.warning)}
                      </p>
                    </div>
                    <span className={`text-2xl ${passed ? 'text-success' : 'text-warning'}`}>
                      {passed ? '✓' : '⚠'}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {allChecksPassed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/interview')}
                className="w-full mt-6 py-4 bg-gradient-to-r from-success to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-success/50 transition-all"
              >
                {t('begin')}
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CameraCheck;
