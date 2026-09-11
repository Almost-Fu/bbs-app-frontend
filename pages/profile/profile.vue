<template>
  <view class="page">
    <!-- 未登录：页面内提示 + 按钮（不弹 toast、不自动跳转，避免"一进来就提醒请先登录"） -->
    <view v-if="!isLogin" class="card">
      <view class="guest-tip">登录后可以修改昵称和头像</view>
      <button class="btn" @tap="goLogin">去登录</button>
    </view>

    <view v-else class="card">
      <view class="field">
        <text class="label">头像</text>
        <image class="avatar-preview" :src="avatarSrc" mode="aspectFill" @error="onAvatarError" />
        <button class="btn-mini" :loading="uploading" :disabled="uploading" @tap="chooseAvatar">
          从相册选择 / 拍照
        </button>
        <text class="hint-text">支持 jpg / png / gif / webp，单张不超过 5MB</text>
      </view>
      <view class="avatar-list">
        <image
          v-for="a in avatarOptions"
          :key="a"
          class="avatar-item"
          :class="{ active: avatar === a }"
          :src="imgUrl(a)"
          mode="aspectFill"
          @tap="avatar = a"
        />
      </view>

      <view class="field">
        <text class="label">或填写图片地址</text>
        <input class="input" v-model="avatar" placeholder="/static/avatars/avatar-1.png 或 https://图片链接" />
        <text class="hint-text">不想上传也可以直接粘贴图片链接（emoji 会被后端拒绝）</text>
      </view>

      <view class="field">
        <text class="label">昵称</text>
        <input class="input" v-model="nickname" placeholder="请输入昵称" maxlength="20" />
      </view>

      <button class="btn" @tap="save">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
// 资料来自数据库：读取 GET /api/auth/me，保存 PATCH /api/users/me
// 头像统一用后端 /static/avatars 下的图片（数据库里存的也是这些图片地址，不再有 emoji）
import { apiMe, apiUpdateMe, apiUploadAvatar, avatarUrl, resolveImageUrl, AVATAR_OPTIONS, DEFAULT_AVATAR } from '../../utils/api'
import { getCurrentUser, setCurrentUser } from '../../utils/store'

const avatar = ref(DEFAULT_AVATAR)
const nickname = ref('')
// 可选头像：后端内置的 8 张 + 默认图
const avatarOptions = AVATAR_OPTIONS
const saving = ref(false)
// 是否正在上传自定义头像（按钮 loading）
const uploading = ref(false)
// 是否已登录：未登录时页面显示「登录后可以修改昵称和头像」，而不是弹提示
const isLogin = ref(false)

/** 预览用：把相对地址补成完整地址 */
const avatarSrc = computed(() => avatarUrl(avatar.value))
const imgUrl = (path) => resolveImageUrl(path)

onShow(async () => {
  // 未登录：只把页面切成"登录后可编辑"的形态，不弹提示、不自动跳登录页
  const cached = getCurrentUser()
  isLogin.value = !!cached
  if (!cached) return

  // 先用本机缓存渲染，秒开；再用后端返回的最新资料覆盖
  nickname.value = cached.nickname || ''
  avatar.value = cached.avatar || DEFAULT_AVATAR
  try {
    // 静默：登录态失效时由请求层统一清缓存 + 只提示一次
    const user = await apiMe({ silent: true })
    nickname.value = user.nickname || ''
    avatar.value = user.avatar || DEFAULT_AVATAR
    setCurrentUser(user) // 同步本机缓存
  } catch (e) {
    // 拉取失败就用缓存兜底
  }
})

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

/** 从相册选择（或拍照）→ 上传为自定义头像：后端上传即写库，这里同步本机缓存 */
function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: async (res) => {
      const path = (res.tempFilePaths || [])[0]
      if (!path) return
      uploading.value = true
      try {
        const user = await apiUploadAvatar(path)
        avatar.value = user.avatar || avatar.value
        setCurrentUser(user)
        uni.showToast({ title: '头像已更新', icon: 'success' })
      } catch (e) {
        // 失败提示已由请求层处理（格式不支持 / 超过大小 / 未登录等）
      } finally {
        uploading.value = false
      }
    }
  })
}

/** 头像图加载失败（例如后端重新部署后 /uploads 里的文件丢了）→ 回落到默认头像 */
function onAvatarError() {
  if (avatar.value !== DEFAULT_AVATAR) avatar.value = DEFAULT_AVATAR
}

async function save() {
  const nick = nickname.value.trim()
  if (!nick) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const user = await apiUpdateMe({ nickname: nick, avatar: avatar.value })
    setCurrentUser(user) // 数据库已更新，同步本机缓存
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch (e) {
    // 错误提示已由请求层处理
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page { background: #f5f6f7; min-height: 100vh; padding: 20rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 30rpx; }
.field { margin-bottom: 24rpx; }
.guest-tip { font-size: 28rpx; color: #666; margin-bottom: 24rpx; }
.hint-text { display: block; font-size: 22rpx; color: #bbb; margin-top: 12rpx; }
.btn-mini { margin-top: 20rpx; height: 68rpx; line-height: 68rpx; padding: 0 28rpx; border-radius: 34rpx; background: #f0f7fc; color: #1296db; font-size: 26rpx; display: inline-block; }
.btn-mini::after { border: none; }
.label { font-size: 26rpx; color: #666; margin-bottom: 12rpx; display: block; }
.avatar-preview { width: 120rpx; height: 120rpx; border-radius: 50%; background: #f0f7fc; display: block; }
.avatar-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 30rpx; }
.avatar-item { width: 80rpx; height: 80rpx; border-radius: 50%; background: #f5f6f7; display: block; border: 2rpx solid transparent; box-sizing: border-box; }
.avatar-item.active { border-color: #1296db; }
.input { background: #f5f6f7; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; }
.btn { margin-top: 20rpx; height: 88rpx; line-height: 88rpx; padding: 0; border-radius: 44rpx; background: linear-gradient(135deg, #ff5f3c, #ff2d55); color: #fff; font-size: 32rpx; }
.btn::after { border: none; }
</style>
