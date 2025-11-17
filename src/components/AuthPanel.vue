<template>
  <div class="auth-panel">
    <el-dialog
      v-model="dialogVisible"
      title="身份认证"
      width="500px"
      :before-close="handleClose"
    >
      <div class="auth-content">
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          :closable="false"
          class="auth-error"
        />

        <el-tabs v-model="authMethod" class="auth-tabs">
          <!-- 匿名认证（当前支持） -->
          <el-tab-pane label="匿名认证" name="anonymous">
            <div class="auth-form">
              <p class="auth-description">
                获取匿名令牌，只能发布到 io.modelcontextprotocol.anonymous/* 命名空间。
              </p>
              <el-button
                type="primary"
                @click="authenticateAnonymous"
                :loading="loading"
                class="auth-button"
              >
                获取匿名令牌
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 认证状态显示 -->
    <div v-if="isAuthenticated" class="auth-status">
      <el-tag type="success" size="small">
        <el-icon><check /></el-icon>
        已认证 ({{ authMethod }})
      </el-tag>
      <el-button
        type="text"
        size="small"
        @click="logout"
        class="logout-button"
      >
        退出登录
      </el-button>
    </div>

    <!-- 认证按钮 -->
    <el-button
      v-else
      type="primary"
      size="small"
      @click="showAuthDialog"
    >
      <el-icon><user /></el-icon>
      登录认证
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, User } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// 响应式状态
const dialogVisible = ref(false)
const authMethod = ref('anonymous')
const githubToken = ref('')
const domain = ref('')
const timestamp = ref('')
const signedTimestamp = ref('')

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

// 显示认证对话框
const showAuthDialog = () => {
  dialogVisible.value = true
  // 清除之前的错误
  authStore.error = null
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  // 清除表单数据
  githubToken.value = ''
  domain.value = ''
  timestamp.value = ''
  signedTimestamp.value = ''
  authStore.error = null
}

// 仅启用匿名认证；其他认证方式暂不可用

// 匿名认证
const authenticateAnonymous = async () => {
  try {
    const result = await authStore.getAnonymousAuth()
    if (result.success) {
      ElMessage.success('匿名认证成功')
      handleClose()
    } else {
      ElMessage.error(result.error)
    }
  } catch (error) {
    ElMessage.error('匿名认证失败')
  }
}

// 其他认证方式（GitHub/DNS/HTTP）已隐藏

// 退出登录
const logout = () => {
  authStore.clearAuth()
  ElMessage.success('已退出登录')
}

// 初始化认证状态
authStore.initAuth()
</script>

<style scoped>
.auth-panel {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.auth-content {
  padding: var(--spacing-lg) 0;
}

.auth-error {
  margin-bottom: var(--spacing-md);
}

.auth-tabs {
  margin-top: var(--spacing-md);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.auth-description {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  font-family: var(--font-family);
}

.auth-button {
  width: 100%;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
}

.auth-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.logout-button {
  padding: 0;
  height: auto;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
}

.logout-button:hover {
  color: var(--primary-color);
}

:deep(.el-dialog) {
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-3);
}

:deep(.el-dialog__header) {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  margin: 0;
}

:deep(.el-dialog__title) {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
  font-family: var(--font-family);
}

:deep(.el-dialog__body) {
  padding: var(--spacing-lg);
}

:deep(.el-dialog__footer) {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

:deep(.el-tabs__item) {
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  
  &.is-active {
    color: var(--primary-color);
  }
  
  &:hover {
    color: var(--primary-hover);
  }
}

:deep(.el-alert) {
  border-radius: var(--radius-md);
  font-family: var(--font-family);
}
</style>
