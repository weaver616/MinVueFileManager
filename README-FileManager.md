# 简介
基于通用对象存储客户端的 Vue.js 文件管理系统，提供完整的文件操作功能（上传/下载/重命名/新建文件夹/删除等）。

## 功能特性

### 核心功能
- ✅ 文件上传（单文件和批量上传）
- ✅ 文件下载（单文件和批量下载）
- ✅ 文件夹创建和管理
- ✅ 文件/文件夹重命名
- ✅ 文件/文件夹删除
- ✅ 文件路径复制
- ✅ 文件搜索
- ✅ 存储统计

### 界面特性
- 🎨 响应式设计
- 📱 移动端适配
- 🔄 实时进度显示
- 📊 文件列表排序
- 🔍 面包屑导航
- ✨ 拖放上传支持

### 技术特性
- 🚀 TypeScript 全面支持
- 🔒 完善的错误处理
- 📝 详细的日志记录
- 🔧 可配置的S3设置
- 📦 模块化API设计

## 安装依赖
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage

## 环境配置（建议）
# 存储配置（建议使用 STORAGE_* 命名）
VITE_STORAGE_ENDPOINT=http://localhost:9000
VITE_STORAGE_ACCESS_KEY=minioadmin
VITE_STORAGE_SECRET_KEY=minioadmin
VITE_STORAGE_BUCKET_NAME=default-bucket
VITE_STORAGE_REGION=us-east-1
VITE_STORAGE_FORCE_PATH_STYLE=true
# 可选项
VITE_STORAGE_MAX_FILE_SIZE=100
VITE_STORAGE_ALLOWED_TYPES=*
VITE_STORAGE_UPLOAD_TIMEOUT=300000

## 使用方式

### 1. 直接使用文件管理页面

访问 `/SimpleFileOperations` 路由即可使用完整的文件管理界面。

### 2. 在其他组件中使用API

```vue
<template>
  <div>
    <a-button @click="uploadFile">上传文件</a-button>
    <a-button @click="downloadFile">下载文件</a-button>
  </div>
</template>

<script setup lang="ts">
import { fileManagerApi } from '@/api/fileManagerApi';

const uploadFile = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        await fileManagerApi.uploadFile(file, 'uploads/');
        console.log('上传成功');
      } catch (error) {
        console.error('上传失败:', error);
      }
    }
  };
  input.click();
};

const downloadFile = async () => {
  try {
    await fileManagerApi.downloadFile('uploads/example.txt');
    console.log('下载开始');
  } catch (error) {
    console.error('下载失败:', error);
  }
};
</script>
```

### 3. 文件管理服务直接调用

```typescript
import { storageService } from '@/services/s3FileService';

// 获取文件列表
const files = await storageService.listObjects('folder/');

// 上传文件
await storageService.uploadFile(file, 'folder/file.txt');

// 下载文件
await storageService.downloadFile('folder/file.txt');
```

## API 接口文档（主要类型）
interface FileObject {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  isDirectory: boolean;
  etag?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

### FileManagerApi 类方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getFileList(path)` | `path: string` | `Promise<S3FileObject[]>` | 获取文件列表 |
| `uploadFile(file, path, onProgress)` | `file: File, path: string, onProgress?: Function` | `Promise<void>` | 上传单个文件 |
| `uploadMultipleFiles(files, path, onProgress)` | `files: File[], path: string, onProgress?: Function` | `Promise<void>` | 批量上传文件 |
| `downloadFile(fileKey, fileName)` | `fileKey: string, fileName?: string` | `Promise<void>` | 下载文件 |
| `downloadMultipleFiles(fileKeys)` | `fileKeys: string[]` | `Promise<void>` | 批量下载文件 |
| `deleteFile(fileKey)` | `fileKey: string` | `Promise<void>` | 删除文件 |
| `deleteFolder(folderPath)` | `folderPath: string` | `Promise<void>` | 删除文件夹 |
| `renameItem(oldKey, newKey)` | `oldKey: string, newKey: string` | `Promise<void>` | 重命名文件/文件夹 |
| `createFolder(folderPath)` | `folderPath: string` | `Promise<void>` | 创建文件夹 |
| `searchFiles(searchTerm, path)` | `searchTerm: string, path: string` | `Promise<S3FileObject[]>` | 搜索文件 |
| `getStorageStats(path)` | `path: string` | `Promise<StorageStats>` | 获取存储统计 |

### 数据类型

```typescript
interface S3FileObject {
  key: string;           // 文件完整路径
  name: string;          // 文件名
  size: number;          // 文件大小（字节）
  lastModified: Date;    // 最后修改时间
  isDirectory: boolean;  // 是否为文件夹
  etag?: string;         // 文件标识
}

interface UploadProgress {
  loaded: number;        // 已上传字节数
  total: number;         // 总字节数
  percentage: number;    // 上传百分比
}
```

## 错误处理

系统提供完善的错误处理机制：

```typescript
import { handleError, createError, ErrorType } from '@/utils/errorHandler';

try {
  await fileManagerApi.uploadFile(file);
} catch (error) {
  // 自动处理并显示错误
  handleError(error, '文件上传');
}

// 创建自定义错误
const customError = createError(
  ErrorType.FILE_TOO_LARGE, 
  '文件大小超过限制'
);
```

## 配置选项

可以通过配置文件自定义S3连接参数：

```typescript
import { S3FileService } from '@/services/s3FileService';

const customS3Service = new S3FileService({
  endpoint: 'https://my-minio.example.com',
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucketName: 'custom-bucket',
  region: 'us-west-2',
  forcePathStyle: true
});
```

## 性能优化

1. **分页加载**: 大文件夹自动分页显示
2. **断点续传**: 大文件上传支持断点续传
3. **缓存机制**: 文件列表智能缓存
4. **懒加载**: 按需加载文件详情

## 安全考虑

1. **文件类型检查**: 可配置允许的文件类型
2. **大小限制**: 可设置最大文件大小
3. **权限验证**: 基于S3权限的访问控制
4. **路径安全**: 防止路径遍历攻击

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 MinIO 服务是否运行
   - 验证 endpoint 配置是否正确

2. **认证错误**
   - 确认 access key 和 secret key 正确
   - 检查用户权限设置

3. **上传失败**
   - 检查文件大小限制
   - 验证存储桶权限

4. **下载问题**
   - 确认文件存在
   - 检查浏览器下载策略

## 开发指南

### 扩展新功能

1. 在 `S3FileService` 中添加底层操作
2. 在 `FileManagerApi` 中封装高级接口
3. 在 Vue 组件中实现用户界面
4. 添加相应的错误处理

### 自定义界面

可以基于提供的API创建自定义的文件管理界面：

```vue
<template>
  <div class="custom-file-manager">
    <!-- 自定义UI实现 -->
  </div>
</template>

<script setup lang="ts">
import { fileManagerApi } from '@/api/fileManagerApi';
// 使用API实现自定义逻辑
</script>
```

## 技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全的 JavaScript
- **Ant Design Vue**: UI 组件库
- **AWS SDK**: S3 客户端
- **Vite**: 现代化构建工具

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 实现基础文件管理功能
- 添加完善的错误处理
- 提供丰富的API接口