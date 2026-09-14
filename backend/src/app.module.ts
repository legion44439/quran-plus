import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuditModule } from './audit/audit.module';
import { AudioModule } from './audio/audio.module';
import { AuthModule } from './auth/auth.module';
import { AyahsModule } from './ayahs/ayahs.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { FavoritesModule } from './favorites/favorites.module';
import { GroupsModule } from './groups/groups.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecitersModule } from './reciters/reciters.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { SurahsModule } from './surahs/surahs.module';
import { TranslationsModule } from './translations/translations.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    SurahsModule,
    AyahsModule,
    TranslationsModule,
    RecitersModule,
    AudioModule,
    CategoriesModule,
    VideosModule,
    CommentsModule,
    FavoritesModule,
    ReportsModule,
    GroupsModule,
    SearchModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
