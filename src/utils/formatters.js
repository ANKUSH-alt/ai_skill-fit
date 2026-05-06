/**
 * Formatting utilities for display
 */

export const formatPhone = (phone) => {
  // Format: +91 98765 43210
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const formatDate = (date, locale = 'en-IN') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date, locale = 'en-IN') => {
  if (!date) return '';
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatScore = (score) => {
  if (score === null || score === undefined) return 'N/A';
  return typeof score === 'number' ? score.toFixed(1) : score;
};

export const formatPercentage = (value, total = 100) => {
  if (!value || !total) return '0%';
  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getCategoryColor = (category) => {
  const colors = {
    job_ready: 'success',
    needs_training: 'warning',
    requires_verification: 'info',
    low_quality: 'danger',
    suspected_fraud: 'danger'
  };
  return colors[category] || 'gray';
};

export const getCategoryLabel = (category) => {
  const labels = {
    job_ready: 'Job Ready',
    needs_training: 'Needs Training',
    requires_verification: 'Requires Verification',
    low_quality: 'Low Quality',
    suspected_fraud: 'Suspected Fraud'
  };
  return labels[category] || category;
};
