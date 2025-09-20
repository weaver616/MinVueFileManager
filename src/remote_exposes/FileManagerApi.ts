// 文件管理API组件入口文件
// 文件管理API的远程暴露接口
export { FileManagerApi, fileManagerApi } from '../api/fileManagerApi';
export type { FileObject, UploadProgress } from '../services/storageService'; // 修复：使用正确的类型导出
export type { S3Config, S3FileObject } from '../services/storageService';
export { storageService, S3FileService } from '../services/storageService';