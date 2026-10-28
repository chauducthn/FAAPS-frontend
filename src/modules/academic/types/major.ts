export type MajorStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface Major {
  id: string;
  code: string;
  name: string;
  description?: string;
  totalCredits: number;
  durationYears: number;
  status: MajorStatus;
  cohort: string;
  createdAt: string;
  updatedAt: string;
}

export interface MajorFilterParams {
  cohort?: string;
  search?: string;
  status?: MajorStatus | 'ALL';
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateMajorDto {
  code: string;
  name: string;
  description?: string;
  totalCredits: number;
  durationYears: number;
  cohort: string;
  status: MajorStatus;
}

export interface UpdateMajorDto extends Partial<CreateMajorDto> {}
