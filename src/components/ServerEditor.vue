<template>
  <div class="server-editor">
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑服务器' : '发布服务器'"
      width="800px"
      :before-close="handleClose"
    >
      <div class="editor-content">
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          :closable="false"
          class="editor-error"
        />

        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          label-position="left"
        >
          <!-- 基本信息 -->
          <el-form-item label="服务器名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="例如: io.github.username/server-name"
              :disabled="isEdit"
            />
            <div class="form-help">
              <span v-if="isEdit">注意：服务器名称不能修改</span>
              <span v-else>格式：命名空间/服务器名，例如 io.github.username/my-server</span>
            </div>
          </el-form-item>

          <el-form-item label="描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入服务器描述"
            />
          </el-form-item>

          <el-form-item label="标题" prop="title">
            <el-input
              v-model="formData.title"
              placeholder="例如: My Awesome MCP Server"
            />
            <div class="form-help">
              <span>可选的服务器标题，用于更好的展示</span>
            </div>
          </el-form-item>

          <el-form-item label="网站 URL" prop="websiteUrl">
            <el-input
              v-model="formData.websiteUrl"
              placeholder="例如: https://example.com/my-server 或 http://gerrit.example.com/project"
            />
            <div class="form-help">
              <span>可选的网站URL，用于提供更多信息</span>
            </div>
          </el-form-item>


          <!-- 版本信息 -->
          <el-form-item label="版本" prop="version">
            <el-input
              v-model="formData.version"
              placeholder="例如: 1.0.0"
            />
          </el-form-item>

          <!-- 仓库信息 -->
          <el-form-item label="仓库 URL" prop="repository_url">
            <el-input
              v-model="formData.repository.url"
              placeholder="例如: https://github.com/username/repo 或 http://gerrit.example.com/project"
            />
          </el-form-item>

          <el-form-item label="仓库源" prop="repository_source">
            <el-select v-model="formData.repository.source" placeholder="选择仓库源">
              <el-option label="GitHub" value="github" />
              <el-option label="GitLab" value="gitlab" />
              <el-option label="Gerrit" value="gerrit" />
            </el-select>
            <div class="form-help">
              <span v-if="formData.repository.source === 'github'">GitHub 格式: https://github.com/username/repo</span>
              <span v-else-if="formData.repository.source === 'gitlab'">GitLab 格式: https://gitlab.com/username/repo</span>
              <span v-else-if="formData.repository.source === 'gerrit'">Gerrit 格式: http://host:port/project/path</span>
              <span v-else>请选择仓库源类型以查看URL格式示例</span>
            </div>
          </el-form-item>

          <el-form-item label="仓库 ID" prop="repository_id">
            <el-input
              v-model="formData.repository.id"
              placeholder="例如: username/repo 或 project-id"
            />
            <div class="form-help">
              <span>仓库的唯一标识符，具体格式取决于仓库源</span>
            </div>
          </el-form-item>

          <!-- 包信息 -->
          <el-form-item label="包配置">
            <div class="packages-section">
              <div
                v-for="(pkg, index) in formData.packages"
                :key="index"
                class="package-item"
              >
                <el-card class="package-card">
                  <div class="package-header">
                    <span>包 {{ index + 1 }}</span>
                    <el-button
                      type="danger"
                      size="small"
                      plain
                      @click="removePackage(index)"
                      :disabled="formData.packages.length === 1"
                    >
                      删除
                    </el-button>
                  </div>

                  <el-form-item label="类型">
                    <el-select v-model="pkg.registryType" placeholder="选择包类型">
                      <el-option label="NPM" value="npm" />
                      <el-option label="PyPI" value="pypi" />
                      <el-option label="OCI" value="oci" />
                      <el-option label="NuGet" value="nuget" />
                      <el-option label="MCPB" value="mcpb" />
                      <el-option label="Wheel" value="wheel" />
                      <el-option label="Binary" value="binary" />
                      <el-option label="Docker" value="docker" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="注册表 URL">
                    <el-select v-model="pkg.registryBaseUrl" placeholder="选择注册表">
                      <el-option label="https://registry.npmjs.org" value="https://registry.npmjs.org" />
                      <el-option label="https://pypi.org" value="https://pypi.org" />
                      <el-option label="https://registry-1.docker.io" value="https://registry-1.docker.io" />
                      <el-option label="https://api.nuget.org" value="https://api.nuget.org" />
                      <el-option label="https://github.com" value="https://github.com" />
                      <el-option label="https://gitlab.com" value="https://gitlab.com" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="传输类型">
                    <el-select v-model="pkg.transport.type" placeholder="选择传输类型">
                      <el-option label="Stdio" value="stdio" />
                      <el-option label="SSE" value="sse" />
                      <el-option label="Streamable HTTP" value="streamable-http" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="包名">
                    <el-input v-model="pkg.identifier" placeholder="包名" />
                  </el-form-item>

                  <el-form-item label="运行提示" v-if="pkg.registryType">
                    <el-select v-model="pkg.runtimeHint" placeholder="选择运行提示">
                      <el-option v-if="pkg.registryType === 'npm'" label="npx" value="npx" />
                      <el-option v-if="pkg.registryType === 'pypi'" label="uvx" value="uvx" />
                      <el-option v-if="pkg.registryType === 'pypi'" label="python" value="python" />
                      <el-option v-if="pkg.registryType === 'wheel'" label="python" value="python" />
                      <el-option v-if="pkg.registryType === 'wheel'" label="wheel" value="wheel" />
                      <el-option v-if="pkg.registryType === 'binary'" label="binary" value="binary" />
                      <el-option v-if="pkg.registryType === 'oci'" label="docker" value="docker" />
                      <el-option v-if="pkg.registryType === 'docker'" label="docker" value="docker" />
                      <el-option v-if="pkg.registryType === 'nuget'" label="dnx" value="dnx" />
                    </el-select>
                  </el-form-item>
                </el-card>
              </div>

              <el-button
                type="primary"
                plain
                @click="addPackage"
                class="add-package-button"
              >
                添加包
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
          >
            {{ isEdit ? '更新' : '发布' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useServersStore } from '../stores/servers'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  server: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const serversStore = useServersStore()
const authStore = useAuthStore()

// 响应式状态
const formRef = ref()
const dialogVisible = ref(false)
const error = ref('')
const loading = computed(() => serversStore.loading)

// 当前服务器状态（用于编辑时的限制）

// 表单数据
const formData = reactive({
  schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
  name: '',
  title: '',
  description: '',
  websiteUrl: '',
  version: '1.0.0',
  versionDetail: {
    version: '1.0.0'
  },
  repository: {
    url: '',
    source: 'github',
    id: ''
  },
  packages: [{
    registryType: 'npm',
    registryBaseUrl: 'https://registry.npmjs.org',
    identifier: '',
    runtimeHint: 'npx',
    transport: {
      type: 'stdio'
    }
  }]
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入服务器名称', trigger: 'blur' },
    { pattern: /^[\w.-]+\/[\w.-]+$/, message: '名称格式应为 namespace/name', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入服务器描述', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  repository_url: [
    { required: true, message: '请输入仓库 URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的 URL', trigger: 'blur' }
  ]
}

// 监听 visible 属性
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    initForm()
  }
})

// 监听 dialogVisible
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 初始化表单
const initForm = () => {
  error.value = ''

  if (props.isEdit && props.server) {
    // 编辑模式：填充现有数据
    const version = props.server.version || props.server.versionDetail?.version || '1.0.0'
    Object.assign(formData, {
      name: props.server.name || '',
      description: props.server.description || '',
      version: version,
      versionDetail: {
        version: version
      },
      repository: {
        url: props.server.repository?.url || '',
        source: props.server.repository?.source || 'github',
        id: props.server.repository?.id || ''
      },
      packages: props.server.packages?.length > 0 ?
        props.server.packages.map(pkg => ({
          registryType: pkg.registryType || 'npm',
          registryBaseUrl: pkg.registryBaseUrl || 'https://registry.npmjs.org',
          identifier: pkg.identifier || '',
          runtimeHint: pkg.runtimeHint || 'npx',
          transport: pkg.transport || { type: 'stdio' }
        })) :
        [{
          registryType: 'npm',
          registryBaseUrl: 'https://registry.npmjs.org',
          identifier: '',
          runtimeHint: 'npx',
          transport: { type: 'stdio' }
        }]
    })
  } else {
    // 新建模式：重置表单
    Object.assign(formData, {
      name: '',
      description: '',
      version: '1.0.0',
      versionDetail: {
        version: '1.0.0'
      },
      repository: {
        url: '',
        source: 'github',
        id: ''
      },
      packages: [{
        registryType: 'npm',
        registryBaseUrl: 'https://registry.npmjs.org',
        identifier: '',
        runtimeHint: 'npx',
        transport: { type: 'stdio' }
      }]
    })
  }
}

// 添加包
const addPackage = () => {
  formData.packages.push({
    registryType: 'npm',
    registryBaseUrl: 'https://registry.npmjs.org',
    identifier: '',
    runtimeHint: 'npx',
    transport: { type: 'stdio' }
  })
}

// 删除包
const removePackage = (index) => {
  if (formData.packages.length > 1) {
    formData.packages.splice(index, 1)
  }
}

// 处理提交
const handleSubmit = async () => {
  try {
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      ElMessage.error('请先进行身份认证')
      return
    }

    // 表单验证
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }

    // 提交数据
    if (props.isEdit) {
      await serversStore.updateServer(props.server.name, props.server.version, formData)
      ElMessage.success('服务器更新成功')
    } else {
      await serversStore.publishServer(formData)
      ElMessage.success('服务器发布成功')
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  error.value = ''
}
</script>

<style scoped>
.editor-content {
  max-height: 600px;
  overflow-y: auto;
}

.editor-error {
  margin-bottom: 16px;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.packages-section {
  width: 100%;
}

.package-item {
  margin-bottom: 16px;
}

.package-card {
  border: 1px solid #dcdfe6;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: bold;
}

.add-package-button {
  width: 100%;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
