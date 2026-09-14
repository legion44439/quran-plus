import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService } from './storage.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('StorageService', () => {
  let service: StorageService;
  const getSignedUrlMock = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = {
      get: (key: string) => {
        const map: Record<string, string> = {
          R2_ACCOUNT_ENDPOINT: 'https://example.r2.cloudflarestorage.com',
          R2_ACCESS_KEY_ID: 'test-key',
          R2_SECRET_ACCESS_KEY: 'test-secret',
          R2_BUCKET: 'test-bucket-from-env',
          R2_PUBLIC_BASE_URL: 'https://cdn.example.com',
        };
        return map[key];
      },
    } as unknown as ConfigService;

    service = new StorageService(config);
    service.onModuleInit();
    getSignedUrlMock.mockResolvedValue('https://signed.example/put');
  });

  it('creates upload presign using env bucket and returns publicUrl', async () => {
    const result = await service.createUploadPresign({
      contentType: 'audio/mpeg',
      folder: 'audio',
      filename: 'track.mp3',
    });

    expect(result.uploadUrl).toBe('https://signed.example/put');
    expect(result.key).toMatch(/^audio\/[0-9a-f-]+-track\.mp3$/);
    expect(result.publicUrl).toBe(`https://cdn.example.com/${result.key}`);
    expect(result.expiresIn).toBe(900);
    expect(getSignedUrlMock).toHaveBeenCalled();

    const command = getSignedUrlMock.mock.calls[0][1] as {
      input: { Bucket: string; Key: string; ContentType: string };
    };
    expect(command.input.Bucket).toBe('test-bucket-from-env');
    expect(command.input.ContentType).toBe('audio/mpeg');
  });

  it('defaults folder to uploads', async () => {
    const result = await service.createUploadPresign({
      contentType: 'image/png',
    });
    expect(result.key).toMatch(/^uploads\/[0-9a-f-]+-file\.png$/);
  });

  it('rejects unsafe folder', async () => {
    await expect(
      service.createUploadPresign({
        contentType: 'audio/mpeg',
        folder: '../etc',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns null publicUrl when base missing', async () => {
    service.setPublicBaseUrlForTests(undefined);
    const result = await service.createUploadPresign({
      contentType: 'audio/mpeg',
      folder: 'audio',
      filename: 'a.mp3',
    });
    expect(result.publicUrl).toBeNull();
  });
});
