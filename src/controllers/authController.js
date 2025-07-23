const User = require('../models/User');
const crypto = require('crypto');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, false, 'Name, email, and password are required');
    }

    if (!validateEmail(email)) {
      return sendResponse(res, 400, false, 'Please provide a valid email address');
    }

    if (!validatePassword(password)) {
      return sendResponse(res, 400, false, 'Password must be at least 6 characters long');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 409, false, 'User already exists with this email');
    }

    const userData = {
      name,
      email,
      password,
      phone,
      role: role || 'customer'
    };

    const user = await User.create(userData);

    const token = user.generateJWT();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };

    return sendResponse(res, 201, true, 'User registered successfully', {
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
    }

    if (!validateEmail(email)) {
      return sendResponse(res, 400, false, 'Please provide a valid email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    const token = user.generateJWT();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };

    return sendResponse(res, 200, true, 'Login successful', {
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return sendResponse(res, 200, true, 'Profile retrieved successfully', {
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return sendResponse(res, 200, true, 'Profile updated successfully', {
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, false, 'Email is required');
    }

    if (!validateEmail(email)) {
      return sendResponse(res, 400, false, 'Please provide a valid email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, false, 'User not found with this email');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    return sendResponse(res, 200, true, 'Password reset token generated successfully', {
      resetToken,
      message: 'In production, this token would be sent via email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendResponse(res, 400, false, 'Token and new password are required');
    }

    if (!validatePassword(newPassword)) {
      return sendResponse(res, 400, false, 'Password must be at least 6 characters long');
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return sendResponse(res, 200, true, 'Password reset successfully');

  } catch (error) {
    console.error('Reset password error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return sendResponse(res, 400, false, 'Current password and new password are required');
    }

    if (!validatePassword(newPassword)) {
      return sendResponse(res, 400, false, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendResponse(res, 400, false, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    const newToken = user.generateJWT();

    return sendResponse(res, 200, true, 'Token refreshed successfully', {
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendResponse(res, 400, false, 'Verification token is required');
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return sendResponse(res, 200, true, 'Email verified successfully');

  } catch (error) {
    console.error('Email verification error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const resendVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user.isEmailVerified) {
      return sendResponse(res, 400, false, 'Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpiry;
    await user.save();

    return sendResponse(res, 200, true, 'Verification email sent successfully', {
      verificationToken,
      message: 'In production, this token would be sent via email'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  verifyEmail,
  resendVerification
};