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
      </a-card>>
    </div>
    文件管理弹窗
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
    <xr-ef-dialog
    v-model:visible="xrEfDialogVisible"
    width="100%"
    height="100%"
    title="流程入口"
    :parentFormRef="EPTFMERGE"
  >
    <!-- 写入DEMO03画面标签 -->
    <!-- 传递数据到DEMO03, 属性名可自定义，此处以 openInDialog、parentInfo 为例 -->
    <EPTFMEGERE
   
    
    >
    </EPTFMEGERE>
  </xr-ef-dialog>

  </div>
</template>

<script lang="ts">
import EFDialogForm, { EFDialogFormMessage } from "EFX/EFDialogForm";
import { defineComponent, ref, h, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { FolderOpenOutlined, ExportOutlined } from '@ant-design/icons-vue';
import SimpleFileOperations from '@/views/SIMPLEFILEOPERATION/SimpleFileOperations.vue';
import { getCurrentStorageConfigAsync } from '@/config/storageConfig';
import EPTFMEGERE  from "EPTFMERGE/EPTFMERGE";


export default defineComponent({
  name: "DEMO",
  components: { 
    SimpleFileOperations 
  },
  setup() {
    const router = useRouter();
    

const EPTFMERGE = ref<any>();

const xrEfDialogVisible = ref(false);
// 点击按钮打开弹框
const openXrEfDialog = async () => {
  xrEfDialogVisible.value = true;
};

    // 文件管理相关状态
    const fileManagerVisible = ref(false);
    const currentPath = ref('');  // 改为空字符串，使用根目录
    const configLoaded = ref(false);

    // 简单的跳出CEFSharp方法
    const openInSystemBrowser = (url: string) => {
      // 直接使用window.open，CEFSharp会处理跳出逻辑
      window.open(url, '_blank');
    };

    // 设置全局链接监听器
    const setupGlobalLinkListener = () => {
      // 直接在document.body上设置监听器
      document.body.addEventListener('click', function(e) { 
        let target = e.target as HTMLElement; 
        
        // 找到被点击的链接 
        while (target && target.tagName !== 'A') { 
          target = target.parentElement as HTMLElement; 
        } 
        
        if (target && target.tagName === 'A') { 
          const link = target as HTMLAnchorElement;
          e.preventDefault(); 
          
          console.log('点击链接:', link.href);
          
          // 通知 CEF 在外部浏览器打开 
          if ((window as any).cefSharp) { 
            console.log('检测到CefSharp环境'); 
            window.open(link.href, '_blank'); 
          } else { 
            console.log('普通浏览器环境'); 
            window.open(link.href, '_blank'); 
          } 
        } 
      });
    };

    // 打开文件管理弹窗
    const openFileManager = async () => {
      try {
        await getCurrentStorageConfigAsync();
        configLoaded.value = true;
        currentPath.value = '';
        fileManagerVisible.value = true;
      } catch (error) {
        console.error('配置加载失败:', error);
      }
    };

    // 在新标签页打开文件管理 - 直接跳出CEFSharp
    const openFileManagerInNewTab = () => {
      const routeData = router.resolve({
        name: 'SimpleFileOperations',
        query: {
          path: currentPath.value || ''
        }
      });
           	
      
      const fullUrl = window.location.origin + routeData.href;
      console.log('打开新窗口:', fullUrl);
      // 直接使用window.open
      window.open(fullUrl, '_blank');

      // EFDialogForm.open(EPTFMEGERE,' ', ' ', '');
    };

    
    // 组件挂载时执行
    onMounted(() => {
      setupGlobalLinkListener();
      openXrEfDialog();
    });

    return {
      // 状态
      fileManagerVisible,
      currentPath,
      configLoaded,
      xrEfDialogVisible,
      EPTFMERGE,
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
