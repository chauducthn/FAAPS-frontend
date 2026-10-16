export type MajorStatus = 'ACTIVE' | 'INACTIVE';

export interface Major {
  id: string;
  code: string;           
  name: string;           
  description?: string;
  totalCredits: number;
  durationYears: number;
  status: MajorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MajorFilterParams {
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
}

export interface UpdateMajorDto extends Partial<CreateMajorDto> {
  status?: MajorStatus;
}