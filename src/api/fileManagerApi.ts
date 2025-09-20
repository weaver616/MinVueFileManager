// 顶部 import 替换为新的导出名
import { storageService, type FileObject, type UploadProgress } from '../services/storageService';

/**
 * 文件管理API - 供其他组件调用的高级接口
 */
export class FileManagerApi {
  /**
   * 获取文件列表
   * @param path 文件路径
   * @returns 文件对象数组
   */
  static async getFileList(path: string = ''): Promise<FileObject[]> {
    try {
      return await storageService.listObjects(path);
    } catch (error) {
      throw new Error(`获取文件列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 上传单个文件
   * @param file 文件对象
   * @param path 上传路径
   * @param onProgress 进度回调
   * @returns Promise<void>
   */
  static async uploadFile(
    file: File, 
    path: string = '', 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    try {
      const key = path + file.name;
      await storageService.uploadFile(file, key, onProgress);
    } catch (error) {
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量上传文件
   * @param files 文件数组
   * @param path 上传路径
   * @param onProgress 进度回调
   * @returns Promise<void>
   */
  static async uploadMultipleFiles(
    files: File[], 
    path: string = '',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<void> {
    try {
      await storageService.uploadMultipleFiles(files, path, onProgress);
    } catch (error) {
      throw new Error(`批量上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 下载文件
   * @param fileKey 文件key
   * @param fileName 文件名（可选）
   * @returns Promise<void>
   */
  static async downloadFile(fileKey: string, fileName?: string): Promise<void> {
    try {
      await storageService.downloadFile(fileKey, fileName);
    } catch (error) {
      throw new Error(`文件下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量下载文件
   * @param fileKeys 文件key数组
   * @returns Promise<void>
   */
  static async downloadMultipleFiles(fileKeys: string[]): Promise<void> {
    try {
      await storageService.downloadMultipleFiles(fileKeys);
    } catch (error) {
      throw new Error(`批量下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除文件
   * @param fileKey 文件key
   * @returns Promise<void>
   */
  static async deleteFile(fileKey: string): Promise<void> {
    try {
      await storageService.deleteFile(fileKey);
    } catch (error) {
      throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除文件夹
   * @param folderPath 文件夹路径
   * @returns Promise<void>
   */
  static async deleteFolder(folderPath: string): Promise<void> {
    try {
      await storageService.deleteFolder(folderPath);
    } catch (error) {
      throw new Error(`删除文件夹失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 重命名文件或文件夹
   * @param oldKey 原始key
   * @param newKey 新key
   * @returns Promise<void>
   */
  static async renameItem(oldKey: string, newKey: string): Promise<void> {
    try {
      await storageService.renameFile(oldKey, newKey);
    } catch (error) {
      throw new Error(`重命名失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建文件夹
   * @param folderPath 文件夹路径
   * @returns Promise<void>
   */
  static async createFolder(folderPath: string): Promise<void> {
    try {
      await storageService.createFolder(folderPath);
    } catch (error) {
      throw new Error(`创建文件夹失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查文件是否存在
   * @param fileKey 文件key
   * @returns Promise<boolean>
   */
  static async fileExists(fileKey: string): Promise<boolean> {
    try {
      return await storageService.fileExists(fileKey);
    } catch {
      return false;
    }
  }

  /**
   * 获取文件的预签名URL
   * @param fileKey 文件key
   * @param expiresIn 过期时间（秒）
   * @returns Promise<string>
   */
  static async getFileUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      return await storageService.getPresignedUrl(fileKey, expiresIn);
    } catch (error) {
      throw new Error(`获取文件URL失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取文件信息
   * @param fileKey 文件key
   * @returns Promise<FileObject | null>
   */
  static async getFileInfo(fileKey: string): Promise<FileObject | null> {
    try {
      const exists = await storageService.fileExists(fileKey);
      if (!exists) return null;

      // 从路径解析文件信息
      const pathParts = fileKey.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const parentPath = pathParts.slice(0, -1).join('/') + (pathParts.length > 1 ? '/' : '');
      
      // 获取父目录的文件列表，从中找到该文件的详细信息
      const parentFiles = await storageService.listObjects(parentPath);
      return parentFiles.find(file => file.key === fileKey) || null;
    } catch {
      return null;
    }
  }

  /**
   * 复制文件
   * @param sourceKey 源文件key
   * @param targetKey 目标文件key
   * @returns Promise<void>
   */
  static async copyFile(sourceKey: string, targetKey: string): Promise<void> {
    try {
      throw new Error('复制功能需要在底层服务中实现 copyObject 方法');
    } catch (error) {
      throw new Error(`复制文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 移动文件
   * @param sourceKey 源文件key
   * @param targetKey 目标文件key
   * @returns Promise<void>
   */
  static async moveFile(sourceKey: string, targetKey: string): Promise<void> {
    try {
      await storageService.renameFile(sourceKey, targetKey);
    } catch (error) {
      throw new Error(`移动文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量操作文件
   * @param operation 操作类型
   * @param fileKeys 文件key数组
   * @param options 操作选项
   * @returns Promise<{ success: string[], failed: string[] }>
   */
  static async batchOperation(
    operation: 'delete' | 'download',
    fileKeys: string[],
    options?: any
  ): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const key of fileKeys) {
      try {
        switch (operation) {
          case 'delete':
            await storageService.deleteFile(key);
            break;
          case 'download':
            await storageService.downloadFile(key);
            break;
        }
        success.push(key);
      } catch (error) {
        failed.push(key);
        console.error(`操作失败: ${key}`, error);
      }
    }

    return { success, failed };
  }

  /**
   * 搜索文件
   * @param searchTerm 搜索关键词
   * @param path 搜索路径
   * @returns Promise<S3FileObject[]>
   */
  static async searchFiles(searchTerm: string, path: string = ''): Promise<FileObject[]> {
    try {
      const allFiles = await storageService.listObjects(path);
      return allFiles.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
    } catch (error) {
      throw new Error(`搜索文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取存储统计信息
   * @param path 路径
   * @returns 统计信息
   */
  static async getStorageStats(path: string = ''): Promise<{
    totalFiles: number;
    totalSize: number;
    folders: number;
  }> {
    try {
      const files = await storageService.listObjects(path);
      const totalFiles = files.filter(f => !f.isDirectory).length; // 修复：使用 isDirectory
      const folders = files.filter(f => f.isDirectory).length; // 修复：使用 isDirectory
      const totalSize = files
        .filter(f => !f.isDirectory) // 修复：使用 isDirectory
        .reduce((sum, file) => sum + file.size, 0);

      return {
        totalFiles,
        totalSize,
        folders
      };
    } catch (error) {
      throw new Error(`获取存储统计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 分块下载文件（用于预览）
   * @param key 文件key
   * @param onProgress 进度回调
   * @param chunkSize 块大小
   * @returns Promise<{ buffer: ArrayBuffer; contentType?: string; size: number }>
   */
  static async downloadInChunks(
    key: string,
    onProgress?: (percent: number) => void,
    chunkSize = 1024 * 1024
  ): Promise<{ buffer: ArrayBuffer; contentType?: string; size: number }> {
    try {
      return await storageService.downloadInChunks(key, onProgress, chunkSize);
    } catch (error) {
      throw new Error(`分块下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 导出便捷的函数式API
export const fileManagerApi = {
  // 文件操作
  getFileList: FileManagerApi.getFileList,
  uploadFile: FileManagerApi.uploadFile,
  uploadMultipleFiles: FileManagerApi.uploadMultipleFiles,
  downloadFile: FileManagerApi.downloadFile,
  downloadMultipleFiles: FileManagerApi.downloadMultipleFiles,
  deleteFile: FileManagerApi.deleteFile,
  renameItem: FileManagerApi.renameItem,
  moveFile: FileManagerApi.moveFile,
  copyFile: FileManagerApi.copyFile,
  
  // 文件夹操作
  createFolder: FileManagerApi.createFolder,
  deleteFolder: FileManagerApi.deleteFolder,
  
  // 工具函数
  fileExists: FileManagerApi.fileExists,
  getFileInfo: FileManagerApi.getFileInfo,
  getFileUrl: FileManagerApi.getFileUrl,
  searchFiles: FileManagerApi.searchFiles,
  getStorageStats: FileManagerApi.getStorageStats,
  
  // 批量操作
  batchOperation: FileManagerApi.batchOperation,
  downloadInChunks: FileManagerApi.downloadInChunks,
};

// 导出类型改为无 S3 前缀
export type { FileObject, UploadProgress };

