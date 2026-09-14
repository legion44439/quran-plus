import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { basename, extname } from 'path';

export interface PresignUploadResult {
  uploadUrl: string;
  publicUrl: string | null;
  key: string;
  expiresIn: number;
}

/**
 * Cloudflare R2 через S3-совместимый API.
 * Bucket и endpoint только из ConfigService/env — без хардкода имён.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private client!: S3Client;
  private bucket!: string;
  private publicBaseUrl?: string;
  /** 15 мин на PUT — достаточно для мобильного аплоада, не даёт вечный URL. */
  private readonly uploadExpiresIn = 900;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const endpoint = this.config.get<string>('R2_ACCOUNT_ENDPOINT');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    const bucket = this.config.get<string>('R2_BUCKET');

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        'R2 env incomplete: need R2_ACCOUNT_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET',
      );
    }

    this.bucket = bucket;
    const base = this.config.get<string>('R2_PUBLIC_BASE_URL')?.replace(/\/$/, '');
    this.publicBaseUrl = base || undefined;

    // R2: region=auto; path-style стабильнее с кастомным endpoint.
    this.client = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  /**
   * Presigned PUT: клиент грузит файл напрямую в R2.
   * key = {folder||uploads}/{uuid}-{safeFilename}
   */
  async createUploadPresign(params: {
    contentType: string;
    folder?: string;
    filename?: string;
  }): Promise<PresignUploadResult> {
    const folder = this.normalizeFolder(params.folder);
    const key = this.buildObjectKey(folder, params.filename, params.contentType);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.uploadExpiresIn,
    });

    return {
      uploadUrl,
      publicUrl: this.buildPublicUrl(key),
      key,
      expiresIn: this.uploadExpiresIn,
    };
  }

  /** Публичный URL при R2_PUBLIC_BASE_URL; иначе null (нужен private GET или свой CDN). */
  buildPublicUrl(key: string): string | null {
    if (!this.publicBaseUrl) return null;
    return `${this.publicBaseUrl}/${key}`;
  }

  /** Для unit-тестов: подменить клиент без реального R2. */
  setClientForTests(client: S3Client) {
    this.client = client;
  }

  setBucketForTests(bucket: string) {
    this.bucket = bucket;
  }

  setPublicBaseUrlForTests(url?: string) {
    this.publicBaseUrl = url?.replace(/\/$/, '') || undefined;
  }

  private normalizeFolder(folder?: string): string {
    const raw = (folder || 'uploads').trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
      throw new BadRequestException(
        'folder must be alphanumeric, underscore or hyphen only',
      );
    }
    return raw;
  }

  private buildObjectKey(
    folder: string,
    filename?: string,
    contentType?: string,
  ): string {
    const safe = this.safeFilename(filename, contentType);
    return `${folder}/${randomUUID()}-${safe}`;
  }

  /** Убираем path traversal и опасные символы — в S3 key попадает только basename. */
  private safeFilename(filename?: string, contentType?: string): string {
    let name = filename ? basename(filename) : '';
    name = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
    if (!name || name === '_') {
      const ext = this.extFromContentType(contentType) || '';
      name = `file${ext}`;
    } else if (!extname(name) && contentType) {
      const ext = this.extFromContentType(contentType);
      if (ext) name = `${name}${ext}`;
    }
    return name.slice(0, 180);
  }

  private extFromContentType(contentType?: string): string | undefined {
    if (!contentType) return undefined;
    const map: Record<string, string> = {
      'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3',
      'audio/wav': '.wav',
      'audio/ogg': '.ogg',
      'audio/webm': '.webm',
      'audio/mp4': '.m4a',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return map[contentType.toLowerCase()];
  }
}
