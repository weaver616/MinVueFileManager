<template>
  <div style="padding: 20px;">
    <h1>Demo 画面</h1>
    <p>文件管理操作演示（SIMPLEFILEOPERATION）。</p>
    
    <div class="file-manager-section" style="margin: 20px 0;">
      <h3>文件管理</h3>
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
import { defineComponent, ref, h, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { FolderOpenOutlined, ExportOutlined } from '@ant-design/icons-vue';
import SimpleFileOperations from '@/views/SIMPLEFILEOPERATION/SimpleFileOperations.vue';


export default defineComponent({
  name: "DEMO",
  components: { 
    SimpleFileOperations 
  },
  setup() {
    const router = useRouter();
    const fileManagerVisible = ref(false);
    const currentPath = ref('');

    const openFileManager = async () => {
      currentPath.value = '';
      fileManagerVisible.value = true;
    };

    const openFileManagerInNewTab = () => {
      const routeData = router.resolve({
        name: 'SimpleFileOperations',
        query: {
          path: currentPath.value || ''
        }
      });
      const fullUrl = window.location.origin + routeData.href;
      window.open(fullUrl, '_blank');
    };

    onMounted(() => {
      // 可按需在挂载时拉取默认路径或数据
    });

    return {
      fileManagerVisible,
      currentPath,
      openFileManager,
      openFileManagerInNewTab,
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

.file-manager-modal :deep(.ant-modal-body) {
  padding: 0;
}
</style>
