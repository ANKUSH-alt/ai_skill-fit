/**
 * Validation utilities for form inputs
 */

export const validatePhone = (phone) => {
  // Indian mobile number validation (10 digits starting with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name) => {
  // Allow letters, spaces, and common Indian name characters
  // Minimum 2 characters
  return name && name.trim().length >= 2;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateExperience = (years) => {
  return !isNaN(years) && years >= 0 && years <= 50;
};

/**
 * Form validation helper
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required && !validateRequired(value)) {
      errors[field] = rule.requiredMessage || 'This field is required';
    } else if (value && rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || 'Invalid value';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
