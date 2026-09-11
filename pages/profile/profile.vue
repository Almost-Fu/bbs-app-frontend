<template>
  <view class="page">
    <view class="card">
      <view class="field">
        <text class="label">头像</text>
        <image class="avatar-preview" :src="avatarSrc" mode="aspectFill" />
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
import { apiMe, apiUpdateMe, avatarUrl, resolveImageUrl, AVATAR_OPTIONS, DEFAULT_AVATAR } from '../../utils/api'
import { getCurrentUser, setCurrentUser, requireLogin } from '../../utils/store'

const avatar = ref(DEFAULT_AVATAR)
const nickname = ref('')
// 可选头像：后端内置的 8 张 + 默认图
const avatarOptions = AVATAR_OPTIONS
const saving = ref(false)

/** 预览用：把相对地址补成完整地址 */
const avatarSrc = computed(() => avatarUrl(avatar.value))
const imgUrl = (path) => resolveImageUrl(path)

onShow(async () => {
  if (!requireLogin()) return
  // 先用本机缓存渲染，秒开；再用后端返回的最新资料覆盖
  const cached = getCurrentUser()
  if (cached) {
    nickname.value = cached.nickname || ''
    avatar.value = cached.avatar || DEFAULT_AVATAR
  }
  try {
    const user = await apiMe()
    nickname.value = user.nickname || ''
    avatar.value = user.avatar || DEFAULT_AVATAR
    setCurrentUser(user) // 同步本机缓存
  } catch (e) {
    // 拉取失败就用缓存兜底
  }
})

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
.label { font-size: 26rpx; color: #666; margin-bottom: 12rpx; display: block; }
.avatar-preview { width: 120rpx; height: 120rpx; border-radius: 50%; background: #f0f7fc; display: block; }
.avatar-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 30rpx; }
.avatar-item { width: 80rpx; height: 80rpx; border-radius: 50%; background: #f5f6f7; display: block; border: 2rpx solid transparent; box-sizing: border-box; }
.avatar-item.active { border-color: #1296db; }
.input { background: #f5f6f7; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; }
.btn { margin-top: 20rpx; height: 88rpx; line-height: 88rpx; padding: 0; border-radius: 44rpx; background: linear-gradient(135deg, #ff5f3c, #ff2d55); color: #fff; font-size: 32rpx; }
.btn::after { border: none; }
</style>
