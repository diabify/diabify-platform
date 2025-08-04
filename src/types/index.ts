// Tipos TypeScript para Diabify 2.0

export type UserRole = 'VISITOR' | 'USER' | 'PROFESSIONAL' | 'ADMIN';

export type DiabetesType = 
  | 'TYPE_1' 
  | 'TYPE_2' 
  | 'GESTATIONAL' 
  | 'PREDIABETES' 
  | 'INFANTIL';

export type ProfessionalType = 
  | 'DIETISTA' 
  | 'NUTRICIONISTA' 
  | 'EDUCADOR' 
  | 'ENTRENADOR' 
  | 'PSICOLOGO' 
  | 'MEDICO';

export type ResourceType = 
  | 'GUIA' 
  | 'LIBRO' 
  | 'MENU' 
  | 'VIDEO' 
  | 'AUDIO' 
  | 'DOCUMENTO';

export type SessionStatus = 
  | 'SCHEDULED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export type PaymentStatus = 
  | 'PENDING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'REFUNDED';

// Interfaces principales
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  healthProfile?: HealthProfile;
  professional?: Professional;
}

export interface HealthProfile {
  id: string;
  userId: string;
  diabetesType?: DiabetesType;
  diagnosedAt?: Date;
  weight?: number;
  height?: number;
  age?: number;
  goals: string[];
  medications: string[];
  allergies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Professional {
  id: string;
  userId: string;
  type: ProfessionalType;
  description?: string;
  experience?: number;
  rating?: number;
  hourlyRate?: number;
  verified: boolean;
  verifiedAt?: Date;
  availability?: Record<string, unknown>; // JSON
  createdAt: Date;
  updatedAt: Date;
  specialties: ProfessionalSpecialty[];
}

export interface ProfessionalSpecialty {
  id: string;
  professionalId: string;
  diabetesType: DiabetesType;
  description?: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  fileUrl?: string;
  thumbnailUrl?: string;
  price?: number;
  tags: string[];
  requiresAuth: boolean;
  premiumOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  clientId: string;
  professionalId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  status: SessionStatus;
  price: number;
  meetingUrl?: string;
  recordingUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: User;
  professional?: Professional;
  payment?: Payment;
}

export interface Payment {
  id: string;
  userId: string;
  sessionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentId?: string;
  professionalAmount?: number;
  platformAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assessment {
  id: string;
  userId?: string;
  responses: Record<string, unknown>; // JSON
  results: Record<string, unknown>; // JSON
  createdAt: Date;
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface HealthProfileForm {
  diabetesType?: DiabetesType;
  diagnosedAt?: Date;
  weight?: number;
  height?: number;
  age?: number;
  goals: string[];
  medications: string[];
  allergies: string[];
}

export interface SessionBookingForm {
  professionalId: string;
  scheduledAt: Date;
  title: string;
  description?: string;
}

// Filtros y búsquedas
export interface ProfessionalFilters {
  type?: ProfessionalType;
  diabetesType?: DiabetesType;
  minRating?: number;
  maxPrice?: number;
  verified?: boolean;
}

export interface ResourceFilters {
  type?: ResourceType;
  tags?: string[];
  freeOnly?: boolean;
  premiumOnly?: boolean;
}

// Estados de la aplicación
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
}
