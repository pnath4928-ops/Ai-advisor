import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as adminService from '../services/adminService';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search, page, limit } = req.query;
    const result = await adminService.getAllUsers({
      role: role as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get users';
    res.status(500).json({ message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await adminService.getUserById(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.status(200).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    res.status(500).json({ message });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    res.status(400).json({ message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.status(200).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    res.status(400).json({ message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await adminService.deleteUser(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    res.status(500).json({ message });
  }
};

export const getAllTeachers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, department, page, limit } = req.query;
    const result = await adminService.getAllTeachers({
      search: search as string,
      department: department as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get teachers';
    res.status(500).json({ message });
  }
};

export const createTeacher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacher = await adminService.createTeacher(req.body);
    res.status(201).json(teacher);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create teacher';
    res.status(400).json({ message });
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacher = await adminService.updateTeacher(req.params.id, req.body);
    if (!teacher) { res.status(404).json({ message: 'Teacher not found' }); return; }
    res.status(200).json(teacher);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update teacher';
    res.status(400).json({ message });
  }
};

export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, gradeLevel, section, page, limit } = req.query;
    const result = await adminService.getAllStudents({
      search: search as string,
      gradeLevel: gradeLevel as string,
      section: section as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get students';
    res.status(500).json({ message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await adminService.createStudent(req.body);
    res.status(201).json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create student';
    res.status(400).json({ message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await adminService.updateStudent(req.params.id, req.body);
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }
    res.status(200).json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update student';
    res.status(400).json({ message });
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getSystemStats();
    res.status(200).json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get stats';
    res.status(500).json({ message });
  }
};
