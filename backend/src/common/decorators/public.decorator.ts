import { SetMetadata } from '@nestjs/common';

/** Маркер «без JWT»: JwtAuthGuard пропускает маршрут (логин, публичный контент). */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
