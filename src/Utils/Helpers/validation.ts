export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\d{10}$/;
export const otpRegex = /^\d{6}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/;

export const normalizePhone = (value: string) => value.replace(/[^0-9]/g, '').slice(0, 10);

export const validateEmail = (value: string) => {
  const email = value.trim();
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Enter valid email address';
  return '';
};

export const validatePhone = (value: string) => {
  const phone = value.trim();
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone)) return 'Phone number must be 10 digits';
  return '';
};

export const validatePassword = (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < 7) {
    return 'Password must be at least 7 characters';
  }
  return '';
};

export const validateOtp = (value: string) => {
  if (!otpRegex.test(value)) return 'Enter the 6 digit OTP';
  return '';
};
