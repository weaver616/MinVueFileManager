/**
 * S3配置文件
 */
export interface S3Configuration 
{
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  forcePathStyle: boolean;
  maxFileSize: number; // 最大文件大小（字节）
  allowedFileTypes: string[]; // 允许的文件类型
  uploadTimeout: number; // 上传超时时间（毫秒）
}

/**
 * 默认S3配置
 */
export const defaultS3Config: S3Configuration = {
  // 优先用 VITE_S3_ENDPOINT；否则用 MINIO 的 host+port+useSSL 组装；再不行回退 localhost:9000
  endpoint:
    import.meta.env.VITE_S3_ENDPOINT ||
    (() => {
      const host = import.meta.env.VITE_MINIO_ENDPOINT;
      const port = import.meta.env.VITE_MINIO_PORT;
      const useSSL =
        String(import.meta.env.VITE_MINIO_USE_SSL || '').toLowerCase() === 'true';
      if (host) {
        return `${useSSL ? 'https' : 'http'}://${host}${port ? `:${port}` : ''}`;
      }
      return 'http://localhost:9000';
    })(),
  accessKeyId:
    import.meta.env.VITE_S3_ACCESS_KEY ||
    import.meta.env.VITE_MINIO_ACCESS_KEY ||
    'minioadmin',
  secretAccessKey:
    import.meta.env.VITE_S3_SECRET_KEY ||
    import.meta.env.VITE_MINIO_SECRET_KEY ||
    'minioadmin',
  region: import.meta.env.VITE_S3_REGION || 'us-east-1',
  bucketName:
    import.meta.env.VITE_S3_BUCKET_NAME ||
    import.meta.env.VITE_MINIO_BUCKET_NAME ||
    'default-bucket',
  // MinIO 建议 PathStyle，若未配置则默认 true
  forcePathStyle:
    import.meta.env.VITE_S3_FORCE_PATH_STYLE !== undefined
      ? String(import.meta.env.VITE_S3_FORCE_PATH_STYLE).toLowerCase() === 'true'
      : true,
  maxFileSize:
    parseInt(import.meta.env.VITE_S3_MAX_FILE_SIZE || '100') * 1024 * 1024, // 默认100MB
  allowedFileTypes: (import.meta.env.VITE_S3_ALLOWED_TYPES || '*').split(','),
  uploadTimeout: parseInt(import.meta.env.VITE_S3_UPLOAD_TIMEOUT || '300000'), // 默认5分钟
};

/**
 * 验证S3配置
 */
export function validateS3Config(config: Partial<S3Configuration>): string[] {
  const errors: string[] = [];

  if (!config.endpoint) {
    errors.push('S3 endpoint 未配置');
  }

  if (!config.accessKeyId) {
    errors.push('S3 access key 未配置');
  }

  if (!config.secretAccessKey) {
    errors.push('S3 secret key 未配置');
  }

  if (!config.bucketName) {
    errors.push('S3 bucket name 未配置');
  }

  return errors;
}

/**
 * 获取当前S3配置
 */
export function getCurrentS3Config(): S3Configuration {
  return { ...defaultS3Config };
}