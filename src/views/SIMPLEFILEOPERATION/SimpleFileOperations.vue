<template>
  <div class="file-manager" :class="{ 'embedded-mode': embedded }">
    <a-card :title="embedded ? '' : '文件管理系统'" class="file-manager-card">
      <!-- 工具栏 -->
      <div class="toolbar">
        <!-- 如果是嵌入模式，显示当前路径信息 -->
        <div v-if="embedded" class="embedded-header">
          <a-space>
            <FolderOutlined />
            <span class="current-path">{{ currentPath || '根目录' }}</span>
          </a-space>
        </div>
        <a-space>
          <a-button type="primary" @click="handleRefresh" :loading="loading">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
          
          <a-upload
            :file-list="[]"
            :before-upload="handleFileUpload"
            :multiple="true"
            :show-upload-list="false"
          >
            <a-button type="primary">
              <template #icon><UploadOutlined /></template>
              上传文件
            </a-button>
          </a-upload>

          <a-button @click="showCreateFolderModal" :disabled="loading">
            <template #icon><FolderAddOutlined /></template>
            新建文件夹
          </a-button>

          <a-button 
            @click="handleBatchDownload" 
            :disabled="selectedRowKeys.length === 0"
          >
            <template #icon><DownloadOutlined /></template>
            批量下载
          </a-button>

          <a-button 
            @click="handleBatchDelete" 
            danger
            :disabled="selectedRowKeys.length === 0"
          >
            <template #icon><DeleteOutlined /></template>
            批量删除
          </a-button>
        </a-space>

        <!-- 目录状态 + 面包屑导航 + 操作提示 -->
        <div class="breadcrumb-area">
          <a-space size="small" align="center" class="dir-status">
            <a-badge :status="isRoot ? 'processing' : 'success'" />
            <span class="dir-status-text">{{ directoryStatusText }}</span>
            <a-button type="link" size="small" @click="goUp" :disabled="isRoot">返回上一级</a-button>
          </a-space>

          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item>
              <a @click="navigateToPath('')">根目录</a>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-for="(segment, index) in pathSegments" :key="index">
              <a @click="navigateToPath(getPathFromSegments(index + 1))">{{ segment }}</a>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
      </div>

      <!-- 文件列表 -->
      <a-table
        :columns="columns"
        :data-source="fileList"
        :loading="loading"
        :row-selection="rowSelection"
        row-key="key"
        size="middle"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number) => `共 ${total} 个项目`
        }"
        :customRow="(record: FileObject) => ({ onDblclick: () => onNameDblClick(record) })"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="file-name-cell" @dblclick="onNameDblClick(record)">
              <component
                :is="record.isDirectory ? FolderOutlined : FileOutlined"
                class="file-icon"
                :class="{ 'folder-icon': record.isDirectory }"
              />
              <span
                class="file-name"
                :class="{ 'clickable': record.isDirectory }"
              >
                {{ record.name }}
              </span>
            </div>
          </template>

          <template v-if="column.key === 'size'">
            {{ record.isDirectory ? '-' : formatFileSize(record.size) }}
          </template>

          <template v-if="column.key === 'lastModified'">
            {{ formatDate(record.lastModified) }}
          </template>

          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button 
                size="small" 
                @click="handleDownload(record)"
                :disabled="record.isDirectory"
              >
                下载
              </a-button>
              
              <a-button size="small" @click="showRenameModal(record)">
                重命名
              </a-button>
              
              <a-button size="small" @click="handleCopyPath(record)">
                复制路径
              </a-button>
              
              <a-popconfirm
                title="确定要删除这个项目吗？"
                @confirm="handleDelete(record)"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 上传进度模态框 -->
      <a-modal
        v-model:open="uploadModalVisible"
        title="文件上传进度"
        :footer="null"
        :closable="false"
        :mask-closable="false"
      >
        <div v-for="(progress, index) in uploadProgress" :key="index" class="upload-progress-item">
          <div class="upload-file-name">{{ progress.fileName }}</div>
          <a-progress :percent="progress.percentage" :status="progress.status" />
        </div>
      </a-modal>

      <!-- 重命名模态框 -->
      <a-modal
        v-model:open="renameModalVisible"
        title="重命名"
        @ok="handleRename"
        @cancel="renameModalVisible = false"
      >
        <a-form :model="renameForm" layout="vertical">
          <a-form-item label="新名称" name="newName" :rules="[{ required: true, message: '请输入新名称' }]">
            <a-input v-model:value="renameForm.newName" placeholder="请输入新名称" />
          </a-form-item>
        </a-form>
      </a-modal>

      <!-- 创建文件夹模态框 -->
      <a-modal
        v-model:open="createFolderModalVisible"
        title="新建文件夹"
        @ok="handleCreateFolder"
        @cancel="createFolderModalVisible = false"
      >
        <a-form :model="createFolderForm" layout="vertical">
          <a-form-item label="文件夹名称" name="folderName" :rules="[{ required: true, message: '请输入文件夹名称' }]">
            <a-input v-model:value="createFolderForm.folderName" placeholder="请输入文件夹名称" />
          </a-form-item>
        </a-form>
      </a-modal>


      <!-- 预览模态框（离线，带进度与水印遮罩） -->
      <a-modal
        v-model:open="preview.visible"
        :title="preview.title"
        width="80%"
        :footer="null"
        @cancel="closePreview"
      >
        <div v-if="preview.loading" class="text-center">
          <a-spin :tip="preview.loadingText" />
          <div v-if="preview.progress > 0" class="mt-2">
            <a-progress :percent="preview.progress" />
          </div>
        </div>
        <div v-else>
          <template v-if="preview.type === 'image'">
            <div class="text-center">
              <img :src="preview.url" alt="预览图片" style="max-width: 100%; max-height: 70vh;" />
            </div>
          </template>
          <template v-else-if="preview.type === 'pdf'">
            <div v-show="preview.type === 'pdf'" class="pdf-container" ref="pdfContainerRef"></div>
          </template>
          <template v-else-if="preview.type === 'docx'">
            <div v-show="preview.type === 'docx'" class="docx-container" ref="docxContainerRef"></div>
          </template>
          <template v-else-if="preview.type === 'xlsx'">
            <div v-show="preview.type === 'xlsx'" class="xlsx-preview-container" ref="xlsxContainerRef"></div>
          </template>
          <template v-else-if="preview.type === 'office'">
            <iframe
              :src="preview.viewerUrl"
              style="width: 100%; height: 70vh; border: none;"
            ></iframe>
          </template>
          <template v-else>
            <div class="text-center">
              <p>暂不支持预览此文件类型</p>
              <a-button type="primary" @click="openInNewTab">在新标签页打开</a-button>
            </div>
          </template>
        </div>
        <div v-if="preview.watermark" class="watermark">{{ preview.watermark }}</div>
        <!-- 水印遮罩 -->
        <div class="watermark-overlay" :style="watermarkStyle"></div>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';

// 添加props支持
interface Props {
  initialPath?: string
  embedded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialPath: '',
  embedded: false
})
import { message } from 'ant-design-vue';
import {
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  FolderOutlined,
  FileOutlined
} from '@ant-design/icons-vue';

import { fileManagerApi, type FileObject, type UploadProgress } from '../../api/fileManagerApi';
import * as XLSX from 'xlsx';

// 定义预览类型
type PreviewType = 'image' | 'pdf' | 'docx' | 'xlsx' | 'office' | 'unknown';

// 预览状态
const preview = reactive({
  visible: false,
  type: 'unknown' as PreviewType,
  title: '',
  loading: false,
  progress: 0,
  loadingText: '加载中...',
  watermark: '',
  url: '',
  viewerUrl: ''
});

// 添加缺失的响应式变量
const isPreviewLoading = ref(false);
const previewProgress = ref(0);
const previewError = ref('');
const previewType = ref<PreviewType>('unknown');

const loading = ref(false);
const fileList = ref<FileObject[]>([]);
const currentPath = ref('');
const selectedRowKeys = ref<string[]>([]);

// 模态框状态
const uploadModalVisible = ref(false);
const renameModalVisible = ref(false);
const createFolderModalVisible = ref(false);

// 表单数据
const renameForm = reactive({
  oldKey: '',
  newName: ''
});

const createFolderForm = reactive({
  folderName: ''
});

// 上传进度
const uploadProgress = ref<Array<{
  fileName: string;
  percentage: number;
  status: 'active' | 'success' | 'exception';
}>>([]);

// 计算属性
const pathSegments = computed(() => {
  return currentPath.value ? currentPath.value.split('/').filter(Boolean) : [];
});

// 新增：目录状态与显示文本
const isRoot = computed(() => !currentPath.value);
const currentPathDisplay = computed(() => (isRoot.value ? '根目录' : `/${pathSegments.value.join('/')}`));
const directoryStatusText = computed(() => `目录：${currentPathDisplay.value} · ${fileList.value.length} 项`);

// 表格列定义
const columns = [
  // 示例：若你的列 sorter 使用了 S3FileObject，替换为 FileObject
  {
    title: '名称',
    dataIndex: 'name',
    sorter: (a: FileObject, b: FileObject) => a.name.localeCompare(b.name),
  },
  {
    title: '大小',
    dataIndex: 'size',
    key: 'size',
    width: 120,
    sorter: (a: FileObject, b: FileObject) => a.size - b.size,
  },
  {
    title: '修改时间',
    dataIndex: 'lastModified',
    key: 'lastModified',
    width: 180,
    sorter: (a: FileObject, b: FileObject) => 
      new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime(),
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
  },
];

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (selectedKeys: string[]) => {
    selectedRowKeys.value = selectedKeys;
  },
  getCheckboxProps: (record: FileObject) => ({
    name: record.name,
  }),
};

// 生命周期钩子
onMounted(() => {
  if (props.initialPath) {
    currentPath.value = props.initialPath
    loadFileList()
  } else {
    loadFileList()
  }
});

// 方法定义
const loadFileList = async () => {
  loading.value = true;
  try {
    // 修改前
    // const objects = await storageService.listObjects(currentPath.value);
    
    // 修改后
    const objects = await fileManagerApi.getFileList(currentPath.value);
    fileList.value = objects;
  } catch (error) {
    message.error('加载文件列表失败: ' + (error as Error).message);
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  loadFileList();
};

const navigateToPath = (path: string) => {
  currentPath.value = path;
  selectedRowKeys.value = [];
  loadFileList();
};

// 新增：返回上一级
const goUp = () => {
  if (isRoot.value) return;
  const path = currentPath.value.endsWith('/') ? currentPath.value.slice(0, -1) : currentPath.value;
  const lastSlash = path.lastIndexOf('/');
  const parent = lastSlash >= 0 ? path.slice(0, lastSlash + 1) : '';
  navigateToPath(parent);
};

const getPathFromSegments = (endIndex: number) => {
  return pathSegments.value.slice(0, endIndex).join('/') + (endIndex > 0 ? '/' : '');
};

const handleFileUpload = (file: File) => {
  const files = Array.isArray(file) ? file : [file];
  uploadFiles(files);
  return false; // 阻止默认上传行为
};

const uploadFiles = async (files: File[]) => {
  uploadModalVisible.value = true;
  uploadProgress.value = files.map(file => ({
    fileName: file.name,
    percentage: 0,
    status: 'active' as const
  }));

  try {
    // 修改前
    // await storageService.uploadMultipleFiles(
    
    // 修改后
    await fileManagerApi.uploadMultipleFiles(
      files,
      currentPath.value,
      (fileIndex: number, progress: UploadProgress) => {
        uploadProgress.value[fileIndex].percentage = progress.percentage;
      }
    );

    // 标记所有上传为成功
    uploadProgress.value.forEach(item => {
      item.status = 'success';
    });

    message.success('文件上传成功');
    setTimeout(() => {
      uploadModalVisible.value = false;
      loadFileList();
    }, 1000);
  } catch (error) {
    // 标记失败的上传
    uploadProgress.value.forEach(item => {
      if (item.percentage < 100) {
        item.status = 'exception';
      }
    });
    message.error('文件上传失败: ' + (error as Error).message);
  }
};

const handleDownload = async (record: FileObject) => {
  await fileManagerApi.downloadFile(record.key, record.name);
};

const handleBatchDownload = async () => {
  const selectedFiles = fileList.value.filter(item => 
    selectedRowKeys.value.includes(item.key) && !item.isDirectory
  );

  if (selectedFiles.length === 0) {
    message.warning('请选择要下载的文件');
    return;
  }

  try {
    const keys = selectedFiles.map(file => file.key);
    await fileManagerApi.downloadMultipleFiles(keys);
    message.success('批量下载开始');
  } catch (error) {
    message.error('批量下载失败: ' + (error as Error).message);
  }
};

const handleDelete = async (record: FileObject) => {
  try {
    if (record.isDirectory) {
      await fileManagerApi.deleteFolder(record.key);
    } else {
      await fileManagerApi.deleteFile(record.key);
    }
    message.success('删除成功');
    loadFileList();
  } catch (error) {
    message.error('删除失败: ' + (error as Error).message);
  }
};

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的项目');
    return;
  }

  const deleteItems = async () => {
    try {
      const deletePromises = selectedRowKeys.value.map(key => {
        const item = fileList.value.find(file => file.key === key);
        if (item) {
          return item.isDirectory 
            ? fileManagerApi.deleteFolder(key)
            : fileManagerApi.deleteFile(key);
        }
      });

      await Promise.all(deletePromises);
      message.success('批量删除成功');
      selectedRowKeys.value = [];
      loadFileList();
    } catch (error) {
      message.error('批量删除失败: ' + (error as Error).message);
    }
  };

  deleteItems();
};
const showRenameModal = (record: FileObject) => {
  renameForm.oldKey = record.key;
  renameForm.newName = record.name;
  renameModalVisible.value = true;
};

const handleRename = async () => {
  try {
    const newKey = currentPath.value + renameForm.newName;
    await fileManagerApi.renameItem(renameForm.oldKey, newKey);
    message.success('重命名成功');
    renameModalVisible.value = false;
    loadFileList();
  } catch (error) {
    message.error('重命名失败: ' + (error as Error).message);
  }
};

const showCreateFolderModal = () => {
  createFolderForm.folderName = '';
  createFolderModalVisible.value = true;
};

const handleCreateFolder = async () => {
  const folderPath = `${currentPath.value}${createFolderForm.folderName}/`;
  await fileManagerApi.createFolder(folderPath);
  message.success('文件夹创建成功');
  createFolderModalVisible.value = false;
  loadFileList();
};

const handleCopyPath = async (record: FileObject) => {
  try {
    await navigator.clipboard.writeText(record.key);
    message.success('路径已复制到剪贴板');
  } catch (error) {
    // 备用方案
    const textArea = document.createElement('textarea');
    textArea.value = record.key;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    message.success('路径已复制到剪贴板');
  }
};

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN');
};

// PDF.js：使用 worker 实例，避免 ?url 解析问题
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// 原先如果有：import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
// 原先如果有：GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
// 替换为 Vite 兼容的 worker 方式
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';
GlobalWorkerOptions.workerPort = new PdfWorker();

// 预览状态与容器
const pdfContainerRef = ref<HTMLDivElement | null>(null);
const docxContainerRef = ref<HTMLDivElement | null>(null);
const xlsxContainerRef = ref<HTMLElement | null>(null);

// 水印样式
const watermarkStyle = computed(() => {
  const text = encodeURIComponent(preview.watermark);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
    <g transform="rotate(-30 110 110)" opacity="0.15">
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#000">${text}</text>
    </g>
  </svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
    backgroundSize: '220px 220px',
  };
});

// 双击：文件夹进入；文件 -> 预览
const onNameDblClick = (record: FileObject) => {
  if (record.isDirectory) {
    navigateToPath(record.key);
  } else {
    openPreview(record);
  }
};

const openPreview = async (record: FileObject) => {
  try {
    const type = determinePreviewType(record.name) as PreviewType;

    preview.visible = true;
    preview.type = type;
    preview.title = `预览：${record.name}`;
    preview.loading = true;
    preview.progress = 0;
    preview.loadingText = '正在分块加载文件...';

    // 清理旧内容
    if (pdfContainerRef.value) pdfContainerRef.value.innerHTML = '';
    if (docxContainerRef.value) docxContainerRef.value.innerHTML = '';
    if (xlsxContainerRef.value) xlsxContainerRef.value.innerHTML = '';

    if (type === 'pdf') {
      const { buffer } = await fileManagerApi.downloadInChunks(
        record.key,
        (p: number) => {
          preview.progress = p;
          preview.loadingText = `正在加载 PDF（${p}%）...`;
        },
        1024 * 1024 // 1MB
      );
      preview.loadingText = '正在解析 PDF...';
      preview.loading = false;
      await nextTick();
      await renderPdf(buffer);
      return;
    }

    if (type === 'docx') {
      const { buffer } = await fileManagerApi.downloadInChunks(
        record.key,
        (p: number) => {
          preview.progress = p;
          preview.loadingText = `正在加载 Word（${p}%）...`;
        },
        1024 * 512 // 512KB
      );
      preview.loadingText = '正在解析 Word...';
      preview.loading = false;
      await nextTick();
      const mod = await import('mammoth/mammoth.browser');
      const mammoth = (mod as any).default ?? mod;
      await renderDocx(buffer, mammoth);
      return;
    }

    if (type === 'xlsx') {
      const { buffer } = await fileManagerApi.downloadInChunks(
        record.key,
        (p: number) => {
          preview.progress = p;
          preview.loadingText = `正在加载 Excel（${p}%）...`;
        },
        1024 * 1024 // 1MB
      );
      preview.loadingText = '正在解析 Excel...';
      preview.loading = false;
      await nextTick();
      await renderXlsxFromBuffer(buffer);
      return;
    }

    preview.loading = false;
    message.info('该文件类型暂不支持离线预览（目前支持：PDF、DOCX、XLSX）');
  } catch (e: any) {
    preview.loading = false;
    message.error('打开预览失败：' + (e?.message || e));
  }
};


const closePreview = () => {
  preview.visible = false;
  preview.type = 'unknown';
  preview.progress = 0;
  preview.loading = false;
  if (pdfContainerRef.value) pdfContainerRef.value.innerHTML = '';
  if (docxContainerRef.value) docxContainerRef.value.innerHTML = '';
  if (xlsxContainerRef.value) xlsxContainerRef.value.innerHTML = '';
};

// 添加缺失的方法
const openInNewTab = () => {
  if (preview.url) {
    window.open(preview.url, '_blank');
  }
};

// PDF 渲染（逐页 Canvas）
const renderPdf = async (buffer: ArrayBuffer) => {
  const pdf = await getDocument({ data: buffer }).promise;
  const container = pdfContainerRef.value;
  if (!container) throw new Error('PDF 预览容器不存在');
  container.innerHTML = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.25 });

    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    container.appendChild(canvas);
  }
};

// 修复PDF渲染方法
const renderPDFPage = async (page: any, canvas: HTMLCanvasElement) => {
  const viewport = page.getViewport({ scale: 1.5 });
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // 修复：添加canvas参数
  await page.render({ 
    canvasContext: ctx, 
    viewport,
    canvas: canvas // 添加这个必需的参数
  }).promise;
};



async function renderXlsxFromBuffer(buffer: ArrayBuffer) {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheetName = wb.SheetNames?.[0];
  if (!sheetName) {
    if (xlsxContainerRef.value) {
      xlsxContainerRef.value.innerHTML = '<div style="color:#999">Excel 文件未包含工作表</div>';
    }
    return;
  }
  const ws = wb.Sheets[sheetName];
  const html = XLSX.utils.sheet_to_html(ws, { header: '', footer: '' });

  if (xlsxContainerRef.value) {
    xlsxContainerRef.value.innerHTML = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.body.firstElementChild || doc.body;
    xlsxContainerRef.value.appendChild(content);
  }
}


// 工具：扩展名
const getExt = (name: string) => {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
};


const determinePreviewType = (name: string) => {
  const ext = getExt(name);
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];
  if (imageExts.includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (['xlsx', 'xls', 'xlsm', 'csv'].includes(ext)) return 'xlsx';
  if (ext === 'doc') return 'doc-legacy';
  return 'unknown';
};


async function renderXlsx(key: string, name: string) {
  try {
    isPreviewLoading.value = true
    previewProgress.value = 0

    const { buffer } = await fileManagerApi.downloadInChunks(
      key,
      (p: number) => (previewProgress.value = p),
      1024 * 1024 // 1MB 分块
    )

    await nextTick() // 确保容器已挂载
    const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
    const sheetName = wb.SheetNames?.[0];
    if (!sheetName) {
      if (xlsxContainerRef.value) {
        xlsxContainerRef.value.innerHTML = '<div style="color:#999">Excel 文件未包含工作表</div>';
      }
      return;
    }
    const ws = wb.Sheets[sheetName];
    const html = XLSX.utils.sheet_to_html(ws, { header: '', footer: '' });

    if (xlsxContainerRef.value) {
      xlsxContainerRef.value.innerHTML = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.body.firstElementChild || doc.body;
      xlsxContainerRef.value.appendChild(content);
    }
  } catch (e: any) {
    console.error('渲染 xlsx 失败:', e)
    previewError.value = e?.message || '渲染 xlsx 失败'
  } finally {
    isPreviewLoading.value = false
    previewType.value = 'xlsx'
  }
}
// DOCX 渲染
const renderDocx = async (buffer: ArrayBuffer, mammoth: any) => {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    const container = docxContainerRef.value;
    if (!container) throw new Error('DOCX 预览容器不存在');
    container.innerHTML = result.value;
    
    // 如果有警告信息，可以在控制台输出
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX 转换警告:', result.messages);
    }
  } catch (error) {
    console.error('DOCX 渲染失败:', error);
    const container = docxContainerRef.value;
    if (!container) return;
    container.innerHTML = '<div style="color: #ff4d4f; padding: 16px;">文档渲染失败</div>';
  }
};
</script>

<style scoped lang="scss">
.file-manager {
  padding: 20px;
  height: 100vh;
  overflow: auto;

  .file-manager-card {
    height: 100%;
    
    .toolbar {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;

      .breadcrumb-area {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 240px;
      }

      .dir-status {
        .dir-status-text {
          color: #555;
        }
      }

      .breadcrumb {
        flex: 1;
        min-width: 200px;
      }

      .breadcrumb-hint {
        font-size: 12px;
      }
    }

    .file-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .file-icon {
        font-size: 16px;
        
        &.folder-icon {
          color: #1890ff;
        }
      }

      .file-name {
        &.clickable {
          color: #1890ff;
          cursor: pointer;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .upload-progress-item {
      margin-bottom: 16px;

      .upload-file-name {
        margin-bottom: 8px;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .file-manager {
    padding: 10px;

    .toolbar {
      flex-direction: column;
      align-items: stretch;

      .breadcrumb {
        order: -1;
      }
    }
  }
}

/* 预览样式 */
.preview-iframe {
  width: 100%;
  height: 70vh;
  border: none;
  background: #fff;
}
.preview-image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
  overflow: auto;

  img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    background: #fff;
  }
}
.preview-wrap {
  position: relative;
  user-select: none;
}
.preview-loading {
  padding: 16px;
  .loading-text {
    margin-top: 8px;
    color: #666;
  }
}
.pdf-container {
  max-height: 70vh;
  overflow: auto;
  background: #fff;
  border: 1px solid #f0f0f0;
}
.pdf-page-canvas {
  display: block;
  margin: 8px auto;
  box-shadow: 0 0 4px rgba(0,0,0,0.08);
}
.docx-container {
  max-height: 70vh;
  overflow: auto;
  background: #fff;
  border: 1px solid #f0f0f0;
  padding: 12px;
}
.watermark-overlay {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background-repeat: repeat;
  z-index: 2;
  opacity: 1;
}
.xlsx-preview-wrapper {
  position: relative;
  height: 70vh; /* 根据你的弹窗高度调整 */
  overflow: auto;
  background: #fff;
}
.xlsx-preview-container :deep(table) {
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
}
.xlsx-preview-container :deep(table td),
.xlsx-preview-container :deep(table th) {
  border: 1px solid #e5e5e5;
  padding: 6px 8px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}
/* 水印类 watermark-mask 如你已定义可复用 */
.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 24px;
  color: rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
}
.text-center {
  text-align: center;
}
.mt-2 {
  margin-top: 8px;
}

.embedded-mode {
  height: 100%;
}

.embedded-mode .file-manager-card {
  height: 100%;
  border: none;
  box-shadow: none;
}

.embedded-header {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.current-path {
  font-weight: 500;
  color: #1890ff;
}
</style>

