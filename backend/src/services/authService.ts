import { User } from '../models/User';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken';
import { RegisterInput, LoginInput } from '../validators/authValidator';

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  profile?: unknown;
}

export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
  });

  let profile: unknown = null;

  if (data.role === 'student') {
    const studentId = `STU${Date.now()}`;
    profile = await Student.create({
      userId: user._id,
      studentId,
      gradeLevel: '10',
      section: 'A',
      learningPreference: 'visual',
      preferredStudyTime: 'morning',
      preferredStudyTechnique: 'active recall',
      academicGoal: '',
    });
  } else if (data.role === 'teacher') {
    const teacherId = `TCH${Date.now()}`;
    profile = await Teacher.create({
      userId: user._id,
      teacherId,
      department: 'General',
      designation: '',
      assignedSubjects: [],
      assignedClasses: [],
    });
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
    profile,
  };
};

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(data.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  let profile: unknown = null;

  if (user.role === 'student') {
    profile = await Student.findOne({ userId: user._id });
  } else if (user.role === 'teacher') {
    profile = await Teacher.findOne({ userId: user._id });
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
    profile,
  };
};

export const refreshToken = async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
  };
};

interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  profile: unknown;
}

export const getMe = async (userId: string): Promise<MeResponse | null> => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    return null;
  }

  let profile: unknown = null;

  if (user.role === 'student') {
    profile = await Student.findOne({ userId: user._id });
  } else if (user.role === 'teacher') {
    profile = await Teacher.findOne({ userId: user._id });
  }

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
  };
};
