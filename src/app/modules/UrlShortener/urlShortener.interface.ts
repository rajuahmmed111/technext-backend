export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

export interface UrlShortenerResponse {
  urls: ShortenedUrl[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUrlRequest {
  originalUrl: string;
}

export interface CreateUrlResponse {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
}
