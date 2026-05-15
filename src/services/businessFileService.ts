import { fileManagerApi } from '@/api/fileManagerApi';
import type { FileObject, UploadProgress } from './storageService';

export class BusinessFileService {
  private static instance: BusinessFileService | null = null;

  private constructor() {}

  static getInstance(): BusinessFileService {
    if (!this.instance) {
      this.instance = new BusinessFileService();
    }
    return this.instance;
  }

  async listFiles(path: string = ''): Promise<FileObject[]> {
    return await fileManagerApi.getFileList(path);
  }

  async uploadFile(
    file: File,
    path: string = '',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    await fileManagerApi.uploadFile(file, path, onProgress);
  }

  async uploadMultipleFiles(
    files: File[],
    path: string = '',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<void> {
    await fileManagerApi.uploadMultipleFiles(files, path, onProgress);
  }

  async downloadFile(fileKey: string, fileName?: string): Promise<void> {
    await fileManagerApi.downloadFile(fileKey, fileName);
  }

  async downloadMultipleFiles(fileKeys: string[]): Promise<void> {
    await fileManagerApi.downloadMultipleFiles(fileKeys);
  }

  async deleteFile(fileKey: string): Promise<void> {
    await fileManagerApi.deleteFile(fileKey);
  }

  async deleteFolder(folderPath: string): Promise<void> {
    await fileManagerApi.deleteFolder(folderPath);
  }

  async renameItem(oldKey: string, newName: string): Promise<void> {
    const parts = oldKey.split('/');
    if (parts.length === 0) {
      return;
    }
    parts[parts.length - 1] = newName;
    const newKey = parts.join('/');
    await fileManagerApi.renameItem(oldKey, newKey);
  }

  async createFolder(folderPath: string): Promise<void> {
    await fileManagerApi.createFolder(folderPath);
  }
}

export const businessFileService = BusinessFileService.getInstance();

