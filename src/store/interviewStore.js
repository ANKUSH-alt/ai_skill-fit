import { create } from 'zustand';

const useInterviewStore = create((set) => ({
  candidateData: { name: '', phone: '', district: '', education: '', experience: 0, role: '', photo: null },
  sessionId: null,
  candidateId: null,
  currentQuestion: 0,
  questions: [],
  responses: [],
  scores: [],
  finalScore: null,

  setCandidateData: (data) => set((s) => ({ candidateData: { ...s.candidateData, ...data } })),
  setSession: (sessionId, candidateId) => {
    if (sessionId) localStorage.setItem('session_id', sessionId);
    set({ sessionId, candidateId });
  },
  setQuestions: (questions) => set({ questions }),
  addResponse: (response) => set((s) => ({ responses: [...s.responses, response] })),
  addScore: (score) => set((s) => ({ scores: [...s.scores, score] })),
  setFinalScore: (finalScore) => set({ finalScore }),
  nextQuestion: () => set((s) => ({ currentQuestion: s.currentQuestion + 1 })),
  reset: () => {
    localStorage.removeItem('session_id');
    set({
      candidateData: { name: '', phone: '', district: '', education: '', experience: 0, role: '', photo: null },
      sessionId: null, candidateId: null, currentQuestion: 0,
      questions: [], responses: [], scores: [], finalScore: null
    });
  }
}));

export default useInterviewStore;
