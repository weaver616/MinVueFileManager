<template>
  <div style="padding: 20px;">
    <h1>Demo 画面</h1>
    <p>这是一个演示页面，展示如何集成文件管理功能。</p>
    
    <!-- 文件管理按钮区域 -->
    <div class="file-manager-section" style="margin: 20px 0;">
      <h3>文件管理功能</h3>
      <a-space>
        <a-button 
          type="primary" 
          @click="openFileManager"
          :icon="h(FolderOpenOutlined)"
          size="large"
        >
          打开文件管理
        </a-button>
        <a-button 
          @click="openFileManagerInNewTab"
          :icon="h(ExportOutlined)"
          size="large"
        >
          新窗口打开
        </a-button>
      </a-space>
    </div>

    <!-- 其他 Demo 内容 -->
    <div class="demo-content">
      <a-card title="功能说明" style="margin-top: 20px;">
        <p>• 点击"打开文件管理"按钮可以在当前页面以弹窗形式打开文件管理器</p>
        <p>• 点击"新窗口打开"按钮可以在新的浏览器标签页中打开文件管理器</p>
        <p>• 文件管理器支持文件的上传、下载、预览等操作</p>
      </a-card>
    </div>

    <!-- 文件管理弹窗 -->
    <a-modal
      v-model:open="fileManagerVisible"
      title="文件管理系统"
      width="90%"
      :footer="null"
      :destroy-on-close="true"
      class="file-manager-modal"
    >
      <div style="height: 70vh;">
        <SimpleFileOperations 
          v-if="fileManagerVisible"
          :initial-path="currentPath"
          :embedded="true"
        />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, h } from "vue";
import { useRouter } from 'vue-router';
import { FolderOpenOutlined, ExportOutlined } from '@ant-design/icons-vue';
import SimpleFileOperations from '@/views/SimpleFileOperations.vue';
import { getCurrentStorageConfigAsync } from '@/config/storageConfig';

export default defineComponent({
  name: "DEMO",
  components: { 
    SimpleFileOperations 
  },
  setup() {
    const router = useRouter();
    
    // 文件管理相关状态
    const fileManagerVisible = ref(false);
    const currentPath = ref('');  // 改为空字符串，使用根目录
    const configLoaded = ref(false);

    // 打开文件管理弹窗 - 修改后
    const openFileManager = async () => {
      try {
        // 确保配置已加载
        await getCurrentStorageConfigAsync();
        configLoaded.value = true;
        currentPath.value = '';  // 改为空字符串，使用根目录
        fileManagerVisible.value = true;
      } catch (error) {
        console.error('配置加载失败:', error);
        // 可以显示错误提示
      }
    };

    // 在新标签页打开文件管理
    const openFileManagerInNewTab = () => {
      const routeData = router.resolve({
        name: 'SimpleFileOperations',
        query: {
          path: currentPath.value || ''  // 改为空字符串
        }
      });
      window.open(routeData.href, '_blank');
    };

    return {
      // 状态
      fileManagerVisible,
      currentPath,
      configLoaded, // 新增
      
      // 函数
      openFileManager,
      openFileManagerInNewTab,
      
      // 图标和工具函数
      h,
      FolderOpenOutlined,
      ExportOutlined
    };
  },
});
</script>

<style scoped>
.file-manager-section {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
}

.demo-content {
  margin-top: 20px;
}

.file-manager-modal :deep(.ant-modal-body) {
  padding: 0;
}
</style>
