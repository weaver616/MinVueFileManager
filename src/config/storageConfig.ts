export interface StorageConfiguration {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  forcePathStyle: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  uploadTimeout: number;
}

// 读取 STORAGE_*，回退到 S3_* 或 MINIO_* 环境变量
export const defaultStorageConfig: StorageConfiguration = {
  endpoint:
    import.meta.env.VITE_STORAGE_ENDPOINT ||
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
    import.meta.env.VITE_STORAGE_ACCESS_KEY ||
    import.meta.env.VITE_S3_ACCESS_KEY ||
    import.meta.env.VITE_MINIO_ACCESS_KEY ||
    'minioadmin',
  secretAccessKey:
    import.meta.env.VITE_STORAGE_SECRET_KEY ||
    import.meta.env.VITE_S3_SECRET_KEY ||
    import.meta.env.VITE_MINIO_SECRET_KEY ||
    'minioadmin',
  region: import.meta.env.VITE_STORAGE_REGION || import.meta.env.VITE_S3_REGION || 'us-east-1',
  bucketName:
    import.meta.env.VITE_STORAGE_BUCKET_NAME ||
    import.meta.env.VITE_S3_BUCKET_NAME ||
    import.meta.env.VITE_MINIO_BUCKET_NAME ||
    'my-bucket',
  forcePathStyle:
    String(import.meta.env.VITE_STORAGE_FORCE_PATH_STYLE || import.meta.env.VITE_S3_FORCE_PATH_STYLE || '')
      .toLowerCase() === 'true',
  maxFileSize: Number(import.meta.env.VITE_STORAGE_MAX_FILE_SIZE || 50 * 1024 * 1024),
  // 修复：添加类型注解
  allowedFileTypes: (import.meta.env.VITE_STORAGE_ALLOWED_TYPES || '*').split(',').map((s: string) => s.trim()),
  uploadTimeout: Number(import.meta.env.VITE_STORAGE_UPLOAD_TIMEOUT || 60_000),
}

export function validateStorageConfig(config: Partial<StorageConfiguration>): string[] {
  const errors: string[] = [];
  if (!config.endpoint) errors.push('存储 endpoint 未配置');
  if (!config.accessKeyId) errors.push('存储 access key 未配置');
  if (!config.secretAccessKey) errors.push('存储 secret key 未配置');
  if (!config.bucketName) errors.push('存储 bucket name 未配置');
  return errors;
}

// ---- 新增：远程配置加载与缓存 ----
const DEFAULT_CONFIG_URL =
  import.meta.env.VITE_STORAGE_CONFIG_URL || `${window.location.origin}/storage-config.json`;

let _current: StorageConfiguration | null = null;
let _loadPromise: Promise<StorageConfiguration> | null = null;

function mergeConfig(
  base: StorageConfiguration,
  overrides: Partial<StorageConfiguration>
): StorageConfiguration {
  const endpoint =
    typeof overrides.endpoint === 'string'
      ? overrides.endpoint.trim().replace(/^`+|`+$/g, '')
      : base.endpoint;
  const accessKeyId =
    typeof overrides.accessKeyId === 'string'
      ? overrides.accessKeyId.trim()
      : base.accessKeyId;
  const secretAccessKey =
    typeof overrides.secretAccessKey === 'string'
      ? overrides.secretAccessKey.trim()
      : base.secretAccessKey;
  const bucketName =
    typeof overrides.bucketName === 'string'
      ? overrides.bucketName.trim()
      : base.bucketName;
  const region =
    typeof overrides.region === 'string'
      ? overrides.region.trim()
      : base.region;
  const forcePathStyle =
    typeof overrides.forcePathStyle === 'boolean'
      ? overrides.forcePathStyle
      : base.forcePathStyle;
  const maxFileSize =
    typeof overrides.maxFileSize === 'number'
      ? overrides.maxFileSize
      : base.maxFileSize;
  const uploadTimeout =
    typeof overrides.uploadTimeout === 'number'
      ? overrides.uploadTimeout
      : base.uploadTimeout;
  return {
    ...base,
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucketName,
    region,
    forcePathStyle,
    maxFileSize,
    uploadTimeout,
    allowedFileTypes: Array.isArray(overrides.allowedFileTypes)
      ? overrides.allowedFileTypes
      : base.allowedFileTypes,
  };
}

export async function loadStorageConfig(url?: string): Promise<StorageConfiguration> {
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    try {
      const res = await fetch(url ?? DEFAULT_CONFIG_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Partial<StorageConfiguration>;
      const merged = mergeConfig(defaultStorageConfig, json);
      const errors = validateStorageConfig(merged);
      if (errors.length) {
        console.warn('远程存储配置缺失字段，将使用默认配置回退:', errors);
        _current = defaultStorageConfig;
      } else {
        _current = merged;
      }
    } catch (e) {
      console.warn('加载远程存储配置失败，将使用默认配置回退:', e);
      _current = defaultStorageConfig;
    }
    return _current!;
  })();
  return _loadPromise;
}

// 修改：优先返回已加载配置，未加载则返回默认配置
export function getCurrentStorageConfig(): StorageConfiguration {
  return _current ?? defaultStorageConfig;
}

// 新增：异步获取（会触发加载）
export async function getCurrentStorageConfigAsync(): Promise<StorageConfiguration> {
  if (_current) return _current;
  return await loadStorageConfig();
}
