export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateSignup = (data: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = 'Full Name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters';
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email Address is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email Address is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 4) {
    errors.password = 'Password must be at least 4 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePostForm = (data: {
  title: string;
  body: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  }

  if (!data.body || data.body.trim().length === 0) {
    errors.body = 'Content body is required';
  } else if (data.body.trim().length < 5) {
    errors.body = 'Content body must be at least 5 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
