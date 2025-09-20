// 文件管理服务组件 - 完整的服务封装
import { FileManagerApi, fileManagerApi } from '../api/fileManagerApi';
import { storageService, S3FileService } from '../services/storageService';
import type { FileObject, UploadProgress, S3Config, S3FileObject } from '../services/storageService';

/**
 * 文件管理服务组件
 * 提供完整的文件管理功能，包括上传、下载、删除、重命名等操作
 */
export class FileManagerService {
  // 静态方法，直接使用 FileManagerApi
  static readonly api = FileManagerApi;
  static readonly service = storageService;
  
  // 便捷的函数式API
  static readonly functions = fileManagerApi;
  
  /**
   * 创建新的存储服务实例
   * @param config S3配置
   * @returns S3FileService实例
   */
  static createStorageService(config?: S3Config): S3FileService {
    return new S3FileService(config);
  }
  
  /**
   * 获取默认存储服务实例
   * @returns 默认的storageService实例
   */
  static getDefaultStorageService() {
    return storageService;
  }
}

// 导出所有相关类型和接口（只保留一次）
export type { FileObject, UploadProgress, S3Config, S3FileObject };

// 导出原始的类和服务（只保留一次）
export { FileManagerApi, fileManagerApi, S3FileService };

// 默认导出服务组件
export default FileManagerService;

// 导出服务实例
export { storageService };