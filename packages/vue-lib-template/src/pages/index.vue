<script setup lang="ts">
import type { FormInstance, FormRules, UploadRawFile, UploadUserFile } from 'element-plus'
import { CircleCheck, Delete, InfoFilled, Plus, Promotion, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import 'element-plus/theme-chalk/el-message.css'

const { t, locale } = useI18n()

// ---------- Form Model ----------
interface Skill { id: number, name: string, years: number }
interface FormModel {
  username: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  age: number | null
  gender: string
  interests: string[]
  location: (string | number)[]
  address: string
  website: string
  dob: string | null // use value-format="YYYY-MM-DD"
  availability: string[] // [start, end]
  time: string | null
  notifications: boolean
  color: string
  salary: number
  tags: string[]
  avatar: UploadUserFile[]
  resume: UploadUserFile[]
  agree: boolean
  skills: Skill[]
}

const makeSkill = (name = '', years = 1): Skill => ({ id: Date.now() + Math.random(), name, years })

const model = reactive<FormModel>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  age: 18,
  gender: '',
  interests: [],
  location: [],
  address: '',
  website: '',
  dob: null,
  availability: [],
  time: null,
  notifications: true,
  color: '#409EFF',
  salary: 50,
  tags: [],
  avatar: [],
  resume: [],
  agree: false,
  skills: [makeSkill('Vue', 3)],
})

const presetTags = ['Vue', 'React', 'Node', 'Design', 'Ops']

// Cascader options (demo)
const cascaderOptions = [
  {
    value: 'cn',
    label: 'China',
    children: [
      { value: 'beijing', label: 'Beijing' },
      { value: 'shanghai', label: 'Shanghai' },
    ],
  },
  {
    value: 'us',
    label: 'United States',
    children: [
      { value: 'sf', label: 'San Francisco' },
      { value: 'la', label: 'Los Angeles' },
    ],
  },
]

const formRef = ref<FormInstance>()

// ---------- Utilities ----------
const disableFuture = (date: Date) => date.getTime() > Date.now()

function yearsFrom(iso: string | null) {
  if (!iso) {
    return 0
  }
  const dob = new Date(iso)
  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    years--
  }
  return years
}

function isUrl(s: string) {
  return URL.canParse(s)
}

// Password strength
const strengthScore = computed(() => {
  const s = model.password || ''
  let score = 0
  if (s.length >= 8) {
    score++
  }
  if (/[A-Z]/.test(s)) {
    score++
  }
  if (/[a-z]/.test(s)) {
    score++
  }
  if (/\d/.test(s)) {
    score++
  }
  if (/[^A-Z0-9]/i.test(s)) {
    score++
  }
  return Math.min(score, 4)
})
const passwordBarWidth = computed(() => `${(strengthScore.value / 4) * 100}%`)
const passwordBarClass = computed(() => {
  return [
    strengthScore.value <= 1 && 'bg-rose-400',
    strengthScore.value === 2 && 'bg-amber-400',
    strengthScore.value === 3 && 'bg-lime-500',
    strengthScore.value >= 4 && 'bg-emerald-600',
  ]
})
const passwordStrengthText = computed(() => {
  const map = locale.value === 'zh' ? ['极弱', '较弱', '一般', '较强', '很强'] : ['Very Weak', 'Weak', 'Fair', 'Good', 'Great']
  return map[strengthScore.value]
})

// ---------- Validators ----------
async function asyncUsernameTaken(val: string) {
  // simulate API latency
  await new Promise(r => setTimeout(r, 400))
  const taken = ['admin', 'test', 'user', '用户']
  return taken.includes((val || '').toLowerCase())
}

const rules = computed<FormRules<FormModel>>(() => ({
  username: [
    { required: true, message: t('v_required'), trigger: 'blur' },
    { pattern: /^\w{3,16}$/, message: t('v_username'), trigger: 'blur' },
    {
      asyncValidator: async (_r, v) => {
        if (!v) {
          return Promise.resolve()
        }
        if (await asyncUsernameTaken(v)) {
          return Promise.reject(new Error(t('v_username_taken')))
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: t('v_required'), trigger: 'blur' },
    { type: 'email', message: t('v_email'), trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: t('v_required'), trigger: 'blur' },
    { min: 8, message: t('v_password_basic'), trigger: 'blur' },
    {
      asyncValidator: (_r, v: string) => {
        if (!v) {
          return Promise.resolve()
        }
        const ok = /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Z0-9]/i.test(v)
        return ok ? Promise.resolve() : Promise.reject(new Error(t('v_password_complex')))
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: t('v_required'), trigger: 'blur' },
    {
      asyncValidator: (_r, v: string) => {
        return v === model.password ? Promise.resolve() : Promise.reject(new Error(t('v_confirm')))
      },
      trigger: ['blur', 'change'],
    },
  ],
  phone: [
    { required: true, message: t('v_required'), trigger: 'blur' },
    { pattern: /^[0-9\-+()\s]{7,20}$/, message: t('v_phone'), trigger: ['blur', 'change'] },
  ],
  age: [
    { required: true, message: t('v_required'), trigger: 'change' },
    {
      asyncValidator: (_r, v: number) => (v >= 18 && v <= 100) ? Promise.resolve() : Promise.reject(new Error(t('v_age'))),
      trigger: 'change',
    },
  ],
  gender: [{ required: true, message: t('v_gender'), trigger: 'change' }],
  interests: [{ type: 'array', required: true, min: 1, message: t('v_interests'), trigger: 'change' }],
  location: [{ type: 'array', required: true, message: t('v_location'), trigger: 'change' }],
  address: [{ required: true, message: t('v_address'), trigger: 'blur' }],
  website: [
    {
      asyncValidator: (_r, v: string) => !v || isUrl(v) ? Promise.resolve() : Promise.reject(new Error(t('v_url'))),
      trigger: 'blur',
    },
  ],
  dob: [
    {
      required: true,
      message: t('v_dob'),
      trigger: 'change',
    },
    {
      asyncValidator: (_r, _v) => {
        if (!model.dob) {
          return Promise.resolve()
        }
        return yearsFrom(model.dob) >= 18 ? Promise.resolve() : Promise.reject(new Error(t('v_18plus')))
      },
      trigger: 'change',
    },
  ],
  availability: [
    {
      asyncValidator: (_r, v: string[]) => {
        if (!v || v.length !== 2) {
          return Promise.reject(new Error(t('v_range')))
        }
        const [s, e] = v
        if (!s || !e) {
          return Promise.reject(new Error(t('v_range')))
        }
        const days = (new Date(e).getTime() - new Date(s).getTime()) / (1000 * 3600 * 24)
        return days >= 1 ? Promise.resolve() : Promise.reject(new Error(t('v_range')))
      },
      trigger: 'change',
    },
  ],
  time: [
    { required: true, message: t('v_time'), trigger: 'change' },
  ],
  tags: [
    {
      asyncValidator: (_r, v: string[]) => (v?.length ?? 0) <= 5 ? Promise.resolve() : Promise.reject(new Error(t('v_tags_max'))),
      trigger: 'change',
    },
  ],
  agree: [{ asyncValidator: (_r, v: boolean) => v ? Promise.resolve() : Promise.reject(new Error(t('v_agree'))), trigger: 'change' }],
  skills: [
    {
      asyncValidator: () => {
        if (!model.skills.length) {
          return Promise.reject(new Error(t('v_skill_required')))
        }
        for (const s of model.skills) {
          if (!s.name) {
            return Promise.reject(new Error(t('v_skill_name_required')))
          }
          if (s.years < 0 || s.years > 50) {
            return Promise.reject(new Error(t('v_skill_years')))
          }
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
  // Upload validations are mostly enforced in beforeUpload hooks
}) satisfies FormRules<FormModel>)

watch(locale, () => {
  // Clear validation messages when switching language
  formRef.value?.clearValidate()
})

// ---------- Upload Hooks ----------
function beforeAvatarUpload(raw: UploadRawFile) {
  const okType = ['image/png', 'image/jpeg', 'image/webp'].includes(raw.type)
  if (!okType) {
    ElMessage.error(t('v_avatar_type'))
    return false
  }
  const okSize = raw.size / 1024 / 1024 <= 2
  if (!okSize) {
    ElMessage.error(t('v_avatar_size'))
    return false
  }
  return true
}

function onAvatarChange() { /* no-op: preview handled by element-plus */ }

function beforeResumeUpload(raw: UploadRawFile) {
  const okType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(raw.type)
  if (!okType) {
    ElMessage.error(t('v_resume_type'))
    return false
  }
  const okSize = raw.size / 1024 / 1024 <= 5
  if (!okSize) {
    ElMessage.error(t('v_resume_size'))
    return false
  }
  return true
}

// ---------- Skills helpers ----------
function addSkill(idx?: number) {
  const s = makeSkill('', 1)
  if (typeof idx === 'number') {
    model.skills.splice(idx + 1, 0, s)
  }
  else { model.skills.push(s) }
}
function removeSkill(idx: number) {
  if (model.skills.length > 1) {
    model.skills.splice(idx, 1)
  }
}

// ---------- Actions ----------
async function onValidate() {
  try {
    await formRef.value?.validate()
    ElMessage.success(`${locale.value === 'zh' ? '校验通过' : 'Validation passed'}`)
  }
  catch {
    ElMessage.error(`${locale.value === 'zh' ? '校验未通过，请检查表单' : 'Validation failed, please check fields'}`)
  }
}

async function onSubmit() {
  try {
    await formRef.value?.validate()
    // Simulate submit
    ElMessage.success(locale.value === 'zh' ? '提交成功（示例）' : 'Submitted (demo)')
    // You could send `model` to your API here
    // console.log(JSON.parse(JSON.stringify(model)))
  }
  catch {
    ElMessage.error(locale.value === 'zh' ? '请先修正校验错误' : 'Please fix validation errors')
  }
}

function onReset() {
  formRef.value?.resetFields()
  model.avatar = []
  model.resume = []
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white font-semibold shadow">CF</span>
        <h1 class="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800">
          {{ t('title') }}
        </h1>
        <span class="hidden md:inline text-slate-400">•</span>
        <p class="hidden md:inline text-slate-500">
          {{ t('subtitle') }}
        </p>
      </div>

      <!-- Language Switcher -->
      <div class="flex items-center gap-2">
        <el-radio-group v-model="locale" size="small">
          <el-radio-button label="zh">
            中文
          </el-radio-button>
          <el-radio-button label="en">
            EN
          </el-radio-button>
        </el-radio-group>
        <el-tooltip :content="t('toggleTips')" placement="bottom">
          <el-button size="small" text :icon="InfoFilled" />
        </el-tooltip>
      </div>
    </div>

    <!-- Card -->
    <el-card class="max-w-6xl mx-auto rounded-2xl shadow-xl border-0">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-800">
              {{ t('formHeader') }}
            </h2>
            <p class="text-sm text-slate-500">
              {{ t('formDesc') }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <el-button size="small" :icon="Refresh" @click="onReset">
              {{ t('reset') }}
            </el-button>
            <el-button type="primary" size="small" :icon="CircleCheck" @click="onValidate">
              {{ t('validate') }}
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="model"
        :rules="rules"
        label-position="top"
        label-width="140px"
        status-icon
        :validate-on-rule-change="false"
        class="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <!-- Username -->
        <el-form-item prop="username" :label="t('username.label')">
          <el-input v-model.trim="model.username" clearable :placeholder="t('username.ph')" />
        </el-form-item>

        <!-- Email -->
        <el-form-item prop="email" :label="t('email.label')">
          <el-input v-model.trim="model.email" clearable :placeholder="t('email.ph')" />
        </el-form-item>

        <!-- Password -->
        <el-form-item prop="password" :label="t('password.label')">
          <el-input v-model="model.password" type="password" show-password :placeholder="t('password.ph')" />
          <div class="mt-2">
            <div class="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="passwordBarClass"
                :style="{ width: passwordBarWidth }"
              />
            </div>
            <div class="mt-1 text-xs text-slate-500 flex justify-between">
              <span>{{ t('password.strength') }}: {{ passwordStrengthText }}</span>
              <span>{{ t('password.rulesHint') }}</span>
            </div>
          </div>
        </el-form-item>

        <!-- Confirm Password -->
        <el-form-item prop="confirmPassword" :label="t('confirmPassword.label')">
          <el-input v-model="model.confirmPassword" type="password" show-password :placeholder="t('confirmPassword.ph')" />
        </el-form-item>

        <!-- Phone -->
        <el-form-item prop="phone" :label="t('phone.label')">
          <el-input v-model.trim="model.phone" clearable :placeholder="t('phone.ph')" />
        </el-form-item>

        <!-- Age -->
        <el-form-item prop="age" :label="t('age.label')">
          <el-input-number v-model="model.age" :min="18" :max="100" :step="1" class="w-full" />
        </el-form-item>

        <!-- Gender -->
        <el-form-item prop="gender" :label="t('gender.label')">
          <el-radio-group v-model="model.gender">
            <el-radio label="male">
              {{ t('gender.male') }}
            </el-radio>
            <el-radio label="female">
              {{ t('gender.female') }}
            </el-radio>
            <el-radio label="other">
              {{ t('gender.other') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Interests -->
        <el-form-item prop="interests" :label="t('interests.label')">
          <el-checkbox-group v-model="model.interests">
            <el-checkbox label="frontend">
              {{ t('interests.frontend') }}
            </el-checkbox>
            <el-checkbox label="backend">
              {{ t('interests.backend') }}
            </el-checkbox>
            <el-checkbox label="devops">
              DevOps
            </el-checkbox>
            <el-checkbox label="design">
              {{ t('interests.design') }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- Country / City -->
        <el-form-item prop="location" :label="t('location.label')">
          <el-cascader v-model="model.location" class="w-full" :options="cascaderOptions" :props="{ checkStrictly: false }" :placeholder="t('location.ph')" />
        </el-form-item>

        <!-- Address -->
        <el-form-item prop="address" :label="t('address.label')">
          <el-input v-model="model.address" :placeholder="t('address.ph')" type="textarea" :rows="2" />
        </el-form-item>

        <!-- Website -->
        <el-form-item prop="website" :label="t('website.label')">
          <el-input v-model.trim="model.website" :placeholder="t('website.ph')" />
        </el-form-item>

        <!-- Date of Birth -->
        <el-form-item prop="dob" :label="t('dob.label')">
          <el-date-picker
            v-model="model.dob"
            type="date"
            class="w-full"
            :placeholder="t('dob.ph')"
            :disabled-date="disableFuture"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- Availability Range -->
        <el-form-item prop="availability" :label="t('availability.label')">
          <el-date-picker
            v-model="model.availability"
            type="daterange"
            unlink-panels
            class="w-full"
            range-separator="→"
            :start-placeholder="t('availability.start')"
            :end-placeholder="t('availability.end')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- Preferred Time -->
        <el-form-item prop="time" :label="t('time.label')">
          <el-time-picker v-model="model.time" class="w-full" :placeholder="t('time.ph')" />
        </el-form-item>

        <!-- Notifications -->
        <el-form-item prop="notifications" :label="t('notifications.label')">
          <div class="flex items-center gap-3">
            <el-switch v-model="model.notifications" />
            <span class="text-slate-500 text-sm">{{ model.notifications ? t('notifications.on') : t('notifications.off') }}</span>
          </div>
        </el-form-item>

        <!-- Preferred Color -->
        <el-form-item prop="color" :label="t('color.label')">
          <el-color-picker v-model="model.color" show-alpha />
        </el-form-item>

        <!-- Salary Expectation -->
        <el-form-item prop="salary" :label="t('salary.label')">
          <div class="px-2">
            <el-slider v-model="model.salary" :min="0" :max="100" :step="1" show-input />
            <div class="text-xs text-slate-500 mt-1">
              {{ t('salary.help') }}
            </div>
          </div>
        </el-form-item>

        <!-- Tags (createable) -->
        <el-form-item prop="tags" :label="t('tags.label')">
          <el-select v-model="model.tags" multiple filterable allow-create default-first-option :placeholder="t('tags.ph')" class="w-full">
            <el-option v-for="opt in presetTags" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>

        <!-- Avatar Upload -->
        <el-form-item prop="avatar" :label="t('avatar.label')">
          <el-upload
            v-model:file-list="model.avatar"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="onAvatarChange"
            :before-upload="beforeAvatarUpload"
            accept="image/png,image/jpeg,image/webp"
          >
            <el-icon><Plus /></el-icon>
            <template #file="{ file }">
              <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
            </template>
          </el-upload>
          <template #error>
            <div class="text-xs text-rose-500">
              {{ t('avatar.error') }}
            </div>
          </template>
          <div class="text-xs text-slate-500">
            {{ t('avatar.tips') }}
          </div>
        </el-form-item>

        <!-- Resume Upload (drag) -->
        <el-form-item prop="resume" :label="t('resume.label')">
          <el-upload
            v-model:file-list="model.resume"
            drag
            :auto-upload="false"
            :before-upload="beforeResumeUpload"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            class="w-full"
          >
            <el-icon class="el-icon--upload">
              <UploadFilled />
            </el-icon>
            <div class="el-upload__text">
              {{ t('resume.drop') }}
            </div>
            <template #tip>
              <div class="el-upload__tip">
                {{ t('resume.tips') }}
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- Dynamic Skills -->
        <el-form-item prop="skills" :label="t('skills.label')" class="md:col-span-2">
          <div class="space-y-3 w-full">
            <div v-for="(skill, idx) in model.skills" :key="skill.id" class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div class="md:col-span-5">
                <el-input v-model.trim="skill.name" :placeholder="t('skills.namePh')" />
              </div>
              <div class="md:col-span-5">
                <el-input-number v-model="skill.years" class="w-full" :min="0" :max="50" />
              </div>
              <div class="md:col-span-2 flex gap-2">
                <el-button text type="primary" :icon="Plus" @click="addSkill(idx)" />
                <el-button text type="danger" :icon="Delete" :disabled="model.skills.length === 1" @click="removeSkill(idx)" />
              </div>
            </div>
            <div class="text-xs text-slate-500">
              {{ t('skills.help') }}
            </div>
          </div>
        </el-form-item>

        <!-- Agree Terms -->
        <el-form-item prop="agree" class="md:col-span-2">
          <el-checkbox v-model="model.agree">
            {{ t('agree') }}
          </el-checkbox>
        </el-form-item>
      </el-form>

      <el-divider class="!my-4" />

      <!-- Action Bar -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div class="text-xs text-slate-500">
          {{ t('footerTips') }}
        </div>
        <div class="flex gap-2">
          <el-button size="large" :icon="Refresh" @click="onReset">
            {{ t('reset') }}
          </el-button>
          <el-button size="large" type="primary" :icon="Promotion" @click="onSubmit">
            {{ t('submit') }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
@reference "../style.css";
/* Optional: polish some Element Plus defaults */
:deep(.el-card__header) {
  @apply bg-gradient-to-r from-sky-50 to-indigo-50;
}
:deep(.el-form-item__label) {
  @apply text-slate-700 font-medium;
}
:deep(.el-input),
:deep(.el-select),
:deep(.el-cascader),
:deep(.el-date-editor),
:deep(.el-textarea) {
  @apply rounded-xl;
}
:deep(.el-button.is-text) {
  @apply rounded-xl;
}
</style>
