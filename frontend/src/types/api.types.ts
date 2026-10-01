export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  errorCode: string;
  message: string;
  errors?: string[];
  path?: string;
  timestamp: string;
}
