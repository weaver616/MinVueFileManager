// 类 S3FileService（仅展示新增/修改的关键片段）
// 顶部 import
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getCurrentStorageConfigAsync } from '@/config/storageConfig';
import { getCurrentS3Config } from '@/config/s3Config'; // 新增：静态导入配置

export interface S3FileObject {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  isDirectory: boolean;
  etag?: string;
}

// 添加 FileObject 类型别名
export type FileObject = S3FileObject;

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  bucketName: string;
  forcePathStyle?: boolean;
}

export class S3FileService {
  private s3Client!: S3Client; // 使用 ! 断言
  private bucketName!: string; // 使用 ! 断言
  // 新增：懒初始化 Promise
  private initPromise: Promise<void> | null = null;

  constructor(config?: S3Config) {
    // 不在构造函数里直接读配置、创建 client；改为懒初始化
    this.initPromise = this.init(config);
  }

  // 新增：初始化逻辑（等待远程配置）
  private async init(config?: S3Config): Promise<void> {
    const base = await getCurrentStorageConfigAsync();
    const resolved = {
      endpoint: config?.endpoint ?? base.endpoint,
      accessKeyId: config?.accessKeyId ?? base.accessKeyId,
      secretAccessKey: config?.secretAccessKey ?? base.secretAccessKey,
      region: config?.region ?? base.region,
      bucketName: config?.bucketName ?? base.bucketName,
      forcePathStyle: config?.forcePathStyle ?? base.forcePathStyle,
    };

    this.bucketName = resolved.bucketName;
    this.s3Client = new S3Client({
      endpoint: resolved.endpoint,
      region: resolved.region,
      credentials: {
        accessKeyId: resolved.accessKeyId,
        secretAccessKey: resolved.secretAccessKey,
      },
      forcePathStyle: resolved.forcePathStyle,
    });
  }

  // 新增：对外确保已初始化
  private async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
  }

  /**
   * 列出指定路径下的文件和文件夹
   */
  async listObjects(prefix: string = ''): Promise<S3FileObject[]> {
    await this.ensureInitialized();
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        Delimiter: '/'
      });

      const response = await this.s3Client.send(command);
      const objects: S3FileObject[] = [];

      // 处理文件夹
      if (response.CommonPrefixes) {
        for (const commonPrefix of response.CommonPrefixes) {
          if (commonPrefix.Prefix) {
            const folderName = commonPrefix.Prefix.slice(prefix.length).replace('/', '');
            if (folderName) {
              objects.push({
                key: commonPrefix.Prefix,
                name: folderName,
                size: 0,
                lastModified: new Date(),
                isDirectory: true
              });
            }
          }
        }
      }

      // 处理文件
      if (response.Contents) {
        for (const content of response.Contents) {
          if (content.Key && content.Key !== prefix) {
            const fileName = content.Key.slice(prefix.length);
            if (fileName && !fileName.includes('/')) {
              objects.push({
                key: content.Key,
                name: fileName,
                size: content.Size || 0,
                lastModified: content.LastModified || new Date(),
                isDirectory: false,
                etag: content.ETag
              });
            }
          }
        }
      }

      return objects;
    } catch (error) {
      console.error('列出对象失败:', error);
      throw new Error(`列出文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 上传单个文件
   */
  async uploadFile(
    file: File,
    key: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    await this.ensureInitialized();
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: file.type || 'application/octet-stream'
        }
      });

      if (onProgress) {
        upload.on('httpUploadProgress', (progress) => {
          if (progress.loaded && progress.total) {
            onProgress({
              loaded: progress.loaded,
              total: progress.total,
              percentage: Math.round((progress.loaded / progress.total) * 100)
            });
          }
        });
      }

      await upload.done();
    } catch (error) {
      console.error('上传文件失败:', error);
      throw new Error(`上传文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultipleFiles(
    files: File[],
    prefix: string = '',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<void> {
    await this.ensureInitialized();
    const uploadPromises = files.map((file, index) => {
      const key = prefix + file.name;
      return this.uploadFile(file, key, (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      });
    });

    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('批量上传失败:', error);
      throw new Error(`批量上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(key: string, fileName?: string): Promise<void> {
    await this.ensureInitialized();
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const response = await this.s3Client.send(command);
      
      if (response.Body) {
        const blob = await new Response(response.Body as ReadableStream).blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || key.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('下载文件失败:', error);
      throw new Error(`下载文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量下载文件（打包为zip）
   */
  async downloadMultipleFiles(keys: string[]): Promise<void> {
    await this.ensureInitialized();
    try {
      // 这里可以使用 JSZip 库来创建 zip 文件
      // 为简化示例，这里只是依次下载每个文件
      for (const key of keys) {
        await this.downloadFile(key);
      }
    } catch (error) {
      console.error('批量下载失败:', error);
      throw new Error(`批量下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<void> {
    await this.ensureInitialized();
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('删除文件失败:', error);
      throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 重命名文件（通过复制和删除实现）
   */
  async renameFile(oldKey: string, newKey: string): Promise<void> {
    await this.ensureInitialized();
    try {
      // 复制文件到新位置
      const copySource = encodeURIComponent(`${this.bucketName}/${oldKey}`);
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: copySource,
        Key: newKey
      });

      await this.s3Client.send(copyCommand);

      // 删除原文件
      await this.deleteFile(oldKey);
    } catch (error) {
      console.error('重命名文件失败:', error);
      throw new Error(`重命名文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建文件夹（通过创建一个以/结尾的空对象实现）
   */
  async createFolder(folderPath: string): Promise<void> {
    await this.ensureInitialized();
    try {
      const key = folderPath.endsWith('/') ? folderPath : folderPath + '/';
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: '',
        ContentType: 'application/x-directory'
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('创建文件夹失败:', error);
      throw new Error(`创建文件夹失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除文件夹（递归删除所有子对象）
   */
  async deleteFolder(folderPrefix: string): Promise<void> {
    await this.ensureInitialized();
    try {
      // 列出文件夹下的所有对象
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folderPrefix
      });

      const response = await this.s3Client.send(listCommand);

      if (response.Contents && response.Contents.length > 0) {
        // 删除所有子对象
        const deletePromises = response.Contents.map((object) => {
          if (object.Key) {
            return this.deleteFile(object.Key);
          }
        });

        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('删除文件夹失败:', error);
      throw new Error(`删除文件夹失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(key: string): Promise<boolean> {
    await this.ensureInitialized();
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取文件的预签名URL
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    await this.ensureInitialized();
    try {
      // 注意：这里需要使用 @aws-sdk/s3-request-presigner 包
      // 为简化示例，这里返回一个基础的URL
      return `${import.meta.env.VITE_S3_ENDPOINT}/${this.bucketName}/${key}`;
    } catch (error) {
      console.error('获取预签名URL失败:', error);
      throw new Error(`获取预签名URL失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 全量下载为 ArrayBuffer（作为回退方案）
  async getObjectArrayBuffer(key: string): Promise<{ buffer: ArrayBuffer; contentType?: string }> {
    const res = await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: key }));
    const body: any = res.Body;
    if (!body) throw new Error('Empty response body');
    let buffer: ArrayBuffer;

    if (typeof body.getReader === 'function') {
      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          total += value.length;
        }
      }
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.length;
      }
      buffer = merged.buffer;
    } else if (body instanceof Blob) {
      buffer = await body.arrayBuffer();
    } else if (body instanceof ArrayBuffer) {
      buffer = body;
    } else {
      const blob = new Blob([body]);
      buffer = await blob.arrayBuffer();
    }

    return { buffer, contentType: res.ContentType };
  }

  // 分块下载并提供进度（默认 1MB/块）
  async downloadInChunks(
    key: string,
    onProgress?: (percent: number) => void,
    chunkSize = 1024 * 1024
  ): Promise<{ buffer: ArrayBuffer; contentType?: string; size: number }> {
    const head = await this.s3Client.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: key }));
    const size = head.ContentLength ?? 0;

    if (!size) {
      const { buffer, contentType } = await this.getObjectArrayBuffer(key);
      onProgress?.(100);
      return { buffer, contentType, size: buffer.byteLength };
    }

    const parts: Uint8Array[] = [];
    let downloaded = 0;
    for (let start = 0; start < size; start += chunkSize) {
      const end = Math.min(start + chunkSize, size);
      const range = `bytes=${start}-${end - 1}`;
      const res = await this.s3Client.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: key, Range: range })
      );
      const body: any = res.Body;
      let ab: ArrayBuffer;

      if (typeof body.getReader === 'function') {
        const reader = body.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            total += value.length;
          }
        }
        const merged = new Uint8Array(total);
        let offset = 0;
        for (const c of chunks) {
          merged.set(c, offset);
          offset += c.length;
        }
        ab = merged.buffer;
      } else if (body instanceof Blob) {
        ab = await body.arrayBuffer();
      } else if (body instanceof ArrayBuffer) {
        ab = body;
      } else {
        const blob = new Blob([body]);
        ab = await blob.arrayBuffer();
      }

      const chunk = new Uint8Array(ab);
      parts.push(chunk);
      downloaded += chunk.byteLength;
      onProgress?.(Math.min(100, Math.round((downloaded / size) * 100)));
    }

    const merged = new Uint8Array(size);
    let offset = 0;
    for (const p of parts) {
      merged.set(p, offset);
      offset += p.length;
    }

    return { buffer: merged.buffer, contentType: head.ContentType, size };
  }
}


export const storageService = new S3FileService();
