/** Роли NestJS: user — только приложение; staff админки = moderator|admin|superadmin */
export type Role = "user" | "moderator" | "admin" | "superadmin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** NestJS POST /auth/login|refresh response */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

/** NestJS GET /users/me response */
export interface MeResponse {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

/** NestJS Surah — id is Int 1–114 (surah number), not uuid */
export interface Surah {
  id: number;
  nameArabic: string;
  nameLatin: string;
  nameEnglish?: string | null;
  revelationType?: string | null;
  ayahCount: number;
  createdAt: string;
  updatedAt: string;
  ayahs?: Ayah[];
}

export type CreateSurahDto = {
  id: number;
  nameArabic: string;
  nameLatin: string;
  nameEnglish?: string;
  revelationType?: string;
  ayahCount?: number;
};

export type UpdateSurahDto = {
  nameArabic?: string;
  nameLatin?: string;
  nameEnglish?: string;
  revelationType?: string;
  ayahCount?: number;
};

/** NestJS Ayah — uuid id; surahId is Int */
export interface Ayah {
  id: string;
  surahId: number;
  number: number;
  textArabic: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateAyahDto = {
  surahId: number;
  number: number;
  textArabic: string;
};

export type UpdateAyahDto = {
  number?: number;
  textArabic?: string;
};

/** NestJS Translation — uuid */
export interface Translation {
  id: string;
  ayahId: string;
  language: string;
  text: string;
  translator?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateTranslationDto = {
  ayahId: string;
  language: string;
  text: string;
  translator?: string;
};

export type UpdateTranslationDto = {
  language?: string;
  text?: string;
  translator?: string;
};

/** NestJS Reciter — uuid */
export interface Reciter {
  id: string;
  name: string;
  nameArabic?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateReciterDto = {
  name: string;
  nameArabic?: string;
  bio?: string;
  imageUrl?: string;
};

export type UpdateReciterDto = {
  name?: string;
  nameArabic?: string;
  bio?: string;
  imageUrl?: string;
};

/** NestJS AudioTrack via /audio — uuid */
export interface AudioTrack {
  id: string;
  title?: string | null;
  url: string;
  durationSec?: number | null;
  reciterId: string;
  surahId?: number | null;
  ayahId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateAudioDto = {
  title?: string;
  url: string;
  durationSec?: number;
  reciterId: string;
  surahId?: number;
  ayahId?: string;
};

export type UpdateAudioDto = {
  title?: string;
  url?: string;
  durationSec?: number;
  reciterId?: string;
  surahId?: number;
  ayahId?: string;
};

export interface Video {
  id: string;
  titleRu: string;
  titleEn?: string;
  descriptionRu?: string;
  url: string;
  thumbnailUrl?: string;
  categoryId?: string;
  durationSec?: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StubListItem = {
  id: string;
  title: string;
  subtitle?: string;
};

/** NestJS GET /users list item (superadmin) */
export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
}
