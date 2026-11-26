export interface Track {
  _id: number;
  name: string;
  author: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  album: string;
  logo: unknown;
  track_file: string;
}

export interface AuthUser {
  email: string;
  username?: string;
  id?: number;
  token?: string;
  key?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
