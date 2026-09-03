import type { BaseEntity } from '@/types/common';

export type WorkerStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type WorkerType = 'LABORER' | 'SUPERVISOR' | 'ENGINEER' | 'MACHINE_OPERATOR' | 'DRIVER' | 'SECURITY';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface WorkerResponse extends BaseEntity {
  projectId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  workerType: WorkerType;
  status: WorkerStatus;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  adhaarNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  bankIFSC?: string;
  hireDate?: string;
  contractEndDate?: string;
  dailyRate?: number;
  skillSet?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface WorkerCreateRequest {
  projectId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  workerType: WorkerType;
  status: WorkerStatus;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  adhaarNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  bankIFSC?: string;
  hireDate?: string;
  contractEndDate?: string;
  dailyRate?: number;
  skillSet?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface WorkerUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  workerType?: WorkerType;
  status?: WorkerStatus;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dailyRate?: number;
  skillSet?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface AttendanceResponse extends BaseEntity {
  workerId: string;
  projectId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  hoursWorked?: number;
  notes?: string;
}

export interface AttendanceCreateRequest {
  workerId: string;
  projectId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  hoursWorked?: number;
  notes?: string;
}

export type Worker = WorkerResponse;
export type WorkerRequest = WorkerCreateRequest | WorkerUpdateRequest;
