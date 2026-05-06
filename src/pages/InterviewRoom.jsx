import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import useLanguage from '../hooks/useLanguage';
import useInterviewStore from '../store/interviewStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const InterviewRoom = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { candidateData, sessionId, addScore } = useInterviewStore();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [followUp, setFollowUp] = useState(null);

  // Load questions from backend
  useEffect(() => {
    const load = async () => {
      try {
        const sid = sessionId || localStorage.getItem('session_id');
        if (sid && sid !== 'demo-session') {
          const res = await fetch(`${API}/api/interview/${sid}/questions`);
          if (res.ok) {
            const data = await res.json();
            setQuestions(data.questions);
            setLoading(false);
            return;
          }
        }
      } catch (e) { console.error(e); }
      // Fallback: load from local JSON
      await loadLocalQuestions();
    };
    load();
  }, [sessionId, language]);

  const loadLocalQuestions = async () => {
    const role = candidateData?.role || 'electrician';
    const langKey = language === 'kannada' ? 'kannada' : language === 'hindi' ? 'hindi' : 'english';
    try {
      const res = await fetch(`/data/questions-${role}.json`);
      if (res.ok) {
        const data = await res.json();
        const ld = data.languages?.[langKey] || {};
        const qs = [
          ...(ld.warmup || []).slice(0, 2),
          ...(ld.technical_easy || []).slice(0, 2),
          ...(ld.technical_medium || []).slice(0, 2),
          ...(ld.situational || []).slice(0, 1)
        ];
        setQuestions(qs.length >= 7 ? qs.slice(0, 7) : [...qs, ...getFallback(language)].slice(0, 7));
      } else {
        setQuestions(getFallback(language));
      }
    } catch { setQuestions(getFallback(language)); }
    setLoading(false);
  };

  const getFallback = (lang) => {
    const q = {
      kannada: [
        { id: 'k1', text: 'ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಬಗ್ಗೆ ಹೇಳಿ', type: 'warmup', tip: 'ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಅನುಭವ ಹೇಳಿ', keywords: [] },
        { id: 'k2', text: 'ನೀವು ಯಾವ ಕೆಲಸ ಮಾಡಿದ್ದೀರಿ', type: 'warmup', tip: 'ನಿಮ್ಮ ಕೆಲಸದ ಅನುಭವ ಹೇಳಿ', keywords: [] },
        { id: 'k3', text: 'ಕೆಲಸದಲ್ಲಿ ಸುರಕ್ಷತೆ ಏಕೆ ಮುಖ್ಯ', type: 'technical', tip: 'ಸುರಕ್ಷತಾ ಕ್ರಮಗಳ ಬಗ್ಗೆ ಹೇಳಿ', keywords: ['ಸುರಕ್ಷತೆ'] },
        { id: 'k4', text: 'ನೀವು ಯಾವ ಉಪಕರಣಗಳನ್ನು ಬಳಸುತ್ತೀರಿ', type: 'technical', tip: 'ಉಪಕರಣಗಳ ಹೆಸರು ಹೇಳಿ', keywords: [] },
        { id: 'k5', text: 'ಸಮಸ್ಯೆ ಬಂದರೆ ಏನು ಮಾಡುತ್ತೀರಿ', type: 'technical', tip: 'ಸಮಸ್ಯೆ ಪರಿಹಾರ ಹೇಳಿ', keywords: [] },
        { id: 'k6', text: 'ಗುಣಮಟ್ಟದ ಕೆಲಸ ಹೇಗೆ ಮಾಡುತ್ತೀರಿ', type: 'technical', tip: 'ಗುಣಮಟ್ಟ ಖಚಿತಪಡಿಸುವ ವಿಧಾನ ಹೇಳಿ', keywords: [] },
        { id: 'k7', text: 'ಕಷ್ಟದ ಸಂದರ್ಭದಲ್ಲಿ ಹೇಗೆ ನಿಭಾಯಿಸುತ್ತೀರಿ', type: 'situational', tip: 'ನಿಮ್ಮ ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ', keywords: [] }
      ],
      hindi: [
        { id: 'h1', text: 'नमस्ते, अपने बारे में बताएं', type: 'warmup', tip: 'अपना नाम और अनुभव बताएं', keywords: [] },
        { id: 'h2', text: 'आपने क्या काम किया है', type: 'warmup', tip: 'अपना काम का अनुभव बताएं', keywords: [] },
        { id: 'h3', text: 'काम में सुरक्षा क्यों जरूरी है', type: 'technical', tip: 'सुरक्षा उपायों के बारे में बताएं', keywords: ['सुरक्षा'] },
        { id: 'h4', text: 'आप कौन से औजार इस्तेमाल करते हैं', type: 'technical', tip: 'औजारों के नाम बताएं', keywords: [] },
        { id: 'h5', text: 'समस्या आने पर क्या करते हैं', type: 'technical', tip: 'समस्या समाधान बताएं', keywords: [] },
        { id: 'h6', text: 'अच्छा काम कैसे करते हैं', type: 'technical', tip: 'गुणवत्ता सुनिश्चित करने का तरीका बताएं', keywords: [] },
        { id: 'h7', text: 'मुश्किल हालात में कैसे संभालते हैं', type: 'situational', tip: 'अपना अनुभव साझा करें', keywords: [] }
      ],
      english: [
        { id: 'e1', text: 'Hello, please tell us about yourself', type: 'warmup', tip: 'Tell your name and experience', keywords: [] },
        { id: 'e2', text: 'What type of work have you done', type: 'warmup', tip: 'Share your work experience', keywords: [] },
        { id: 'e3', text: 'Why is safety important in your work', type: 'technical', tip: 'Talk about safety measures', keywords: ['safety'] },
        { id: 'e4', text: 'What tools do you use in your work', type: 'technical', tip: 'Name the tools you use', keywords: [] },
        { id: 'e5', text: 'What do you do when a problem occurs', type: 'technical', tip: 'Explain your problem solving approach', keywords: [] },
        { id: 'e6', text: 'How do you ensure quality in your work', type: 'technical', tip: 'Explain your quality method', keywords: [] },
        { id: 'e7', text: 'How do you handle difficult situations at work', type: 'situational', tip: 'Share your experience', keywords: [] }
      ]
    };
    return q[lang] || q.english;
  };

  const currentQ = questions[currentIdx];
  const total = questions.length;

  // Timer
  useEffect(() => {
    let interval;
    if (isRecording) interval = setInterval(() => setTimer(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Auto-play question audio
  useEffect(() => {
    if (currentQ) setTimeout(() => playAudio(), 600);
  }, [currentIdx, currentQ]);

  const playAudio = () => {
    if (!currentQ) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(currentQ.text);
    utt.lang = language === 'kannada' ? 'kn-IN' : language === 'hindi' ? 'hi-IN' : 'en-IN';
    utt.rate = 0.85;
    utt.pitch = 1.0;
    window.speechSynthesis.speak(utt);
  };

  const startRecording = () => {
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(iv); setCountdown(null); beginRecording(); }
    }, 1000);
  };

  const beginRecording = () => {
    setTimer(0);
    setIsRecording(true);
    chunksRef.current = [];
    const stream = webcamRef.current?.stream;
    if (!stream) return;
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => setRecordedBlob(new Blob(chunksRef.current, { type: 'video/webm' }));
    mr.start();
    mediaRecorderRef.current = mr;
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const submitAnswer = async () => {
    setSubmitting(true);
    setFollowUp(null);
    try {
      const sid = sessionId || localStorage.getItem('session_id');
      if (sid && recordedBlob && !sid.startsWith('demo')) {
        const formData = new FormData();
        formData.append('video', recordedBlob, 'answer.webm');
        formData.append('question_id', currentQ.id);
        formData.append('question_text', currentQ.text);
        formData.append('question_type', currentQ.type || 'technical');
        const res = await fetch(`${API}/api/interview/${sid}/submit-response`, { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.follow_up_question) setFollowUp(data.follow_up_question);
        }
      }
      // Store mock score for display
      addScore({ questionId: currentQ.id, question: currentQ.text, overall_score: 6.5,
        technical_score: 6.5, communication_score: 6.5, confidence_score: 6.5, language_score: 7.0 });
    } catch (e) { console.error(e); }

    if (currentIdx < total - 1) {
      setCurrentIdx(p => p + 1);
      setRecordedBlob(null);
      setTimer(0);
    } else {
      navigate('/processing');
    }
    setSubmitting(false);
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">{t('please_wait')}</div>
    </div>
  );

  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-center">
          <p className="text-gray-400 text-lg">{t('question_label')} {currentIdx + 1} {t('of_label')} {total}</p>
          <div className="flex gap-2 justify-center mt-2">
            {questions.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${
                i === currentIdx ? 'w-8 bg-primary' : i < currentIdx ? 'w-2 bg-success' : 'w-2 bg-gray-600'
              }`} />
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Video Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-dark-card rounded-3xl shadow-2xl p-6">
            <div className="aspect-[4/3] bg-dark rounded-2xl overflow-hidden relative">
              <Webcam ref={webcamRef} audio={true} className="w-full h-full object-cover" mirrored={true} />
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-danger px-4 py-2 rounded-full">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                    className="w-3 h-3 rounded-full bg-white" />
                  <span className="text-white font-bold">{fmt(timer)}</span>
                </div>
              )}
              {countdown !== null && (
                <div className="absolute inset-0 bg-dark/80 flex items-center justify-center">
                  <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }}
                    className="text-9xl font-bold text-primary">{countdown || '🎙️'}</motion.div>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {!recordedBlob && !isRecording && countdown === null && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startRecording}
                  className="w-full py-4 bg-gradient-to-r from-danger to-red-600 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white" />{t('recording_starts')}
                </motion.button>
              )}
              {isRecording && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={stopRecording}
                  className="w-full py-4 bg-gray-600 text-white font-bold text-lg rounded-xl">
                  {t('stop_recording')}
                </motion.button>
              )}
              {recordedBlob && !isRecording && (
                <div className="grid grid-cols-2 gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setRecordedBlob(null); setTimer(0); }}
                    className="py-4 bg-gray-600 text-white font-bold rounded-xl">
                    {t('retake_answer')}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={submitAnswer} disabled={submitting}
                    className="py-4 bg-gradient-to-r from-success to-green-600 text-white font-bold rounded-xl disabled:opacity-50">
                    {submitting ? '...' : t('submit_answer')}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Question Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-dark-card rounded-3xl shadow-2xl p-6 flex flex-col">
            <div className="mb-4">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                currentQ.type === 'warmup' ? 'bg-info/20 text-info' :
                currentQ.type === 'technical' ? 'bg-primary/20 text-primary' :
                currentQ.type === 'safety' ? 'bg-warning/20 text-warning' :
                'bg-success/20 text-success'
              }`}>
                {t(`type_${currentQ.type}`) || currentQ.type}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={currentIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col">
                <p className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">{currentQ.text}</p>
                <button onClick={playAudio}
                  className="self-start mb-6 px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl font-semibold flex items-center gap-2 transition-all">
                  🔊 {t('hear_again')}
                </button>
                {followUp && (
                  <div className="mb-4 p-4 bg-warning/10 border border-warning rounded-xl">
                    <p className="text-warning font-semibold text-sm mb-1">Follow-up:</p>
                    <p className="text-white">{followUp}</p>
                  </div>
                )}
                <div className="mt-auto">
                  <div className="bg-success/10 border-l-4 border-success rounded-lg p-4">
                    <p className="text-success font-semibold mb-1">{t('tip_speak')}</p>
                    <p className="text-gray-300 text-sm">{currentQ.tip}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
