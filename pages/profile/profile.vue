<template>
  <view class="page">
    <view class="card">
      <view class="field">
        <text class="label">头像</text>
        <view class="avatar-preview">{{ avatar }}</view>
      </view>
      <view class="avatar-list">
        <view v-for="a in avatarOptions" :key="a" class="avatar-item" :class="{ active: avatar === a }" @tap="avatar = a">{{ a }}</view>
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
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCurrentUser, updateUser } from '../../utils/store'

const avatar = ref('🙂')
const nickname = ref('')
const avatarOptions = ['🙂', '😊', '😎', '🤓', '🧑‍💻', '👩', '👦', '🐱', '🐶', '🦊', '🐼', '🐸', '🚀', '⚽', '🍜', '💻']
let username = ''

onShow(() => {
  const user = getCurrentUser()
  if (user) {
    username = user.username
    nickname.value = user.nickname || ''
    avatar.value = user.avatar || '🙂'
  }
})

function save() {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }
  updateUser(username, { nickname: nickname.value.trim(), avatar: avatar.value })
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style scoped>
.page { background: #f5f6f7; min-height: 100vh; padding: 20rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 30rpx; }
.field { margin-bottom: 24rpx; }
.label { font-size: 26rpx; color: #666; margin-bottom: 12rpx; display: block; }
.avatar-preview { width: 120rpx; height: 120rpx; border-radius: 50%; background: #f0f7fc; text-align: center; line-height: 120rpx; font-size: 64rpx; }
.avatar-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 30rpx; }
.avatar-item { width: 80rpx; height: 80rpx; border-radius: 50%; background: #f5f6f7; text-align: center; line-height: 80rpx; font-size: 44rpx; border: 2rpx solid transparent; }
.avatar-item.active { border-color: #1296db; background: #eaf6ff; }
.input { background: #f5f6f7; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; }
.btn { margin-top: 20rpx; height: 88rpx; line-height: 88rpx; padding: 0; border-radius: 44rpx; background: linear-gradient(135deg, #ff5f3c, #ff2d55); color: #fff; font-size: 32rpx; }
.btn::after { border: none; }
</style>
