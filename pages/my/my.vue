<template>
  <view class="page">
    <view class="user-card" @tap="onUserTap">
      <view class="avatar">{{ user && user.avatar ? user.avatar : '🙂' }}</view>
      <view class="user-info">
        <text class="nickname">{{ user ? user.nickname : '游客' }}</text>
        <text class="slogan">{{ user ? '欢迎回来，' + user.username : '登录 / 注册，体验完整功能' }}</text>
      </view>
      <text class="arrow">›</text>
    </view>

    <view v-if="user" class="menu">
      <view class="menu-item" @tap="logout">
        <text>退出登录</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="menu">
      <view class="menu-item" @tap="goMyPosts">
        <text>我的帖子</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goFavorites">
        <text>我的收藏</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goSettings">
        <text>设置</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <tab-bar current="my" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCurrentUser, clearCurrentUser, requireLogin } from '../../utils/store'

const user = ref(null)

onShow(() => {
  user.value = getCurrentUser()
})

function onUserTap() {
  if (!user.value) {
    uni.navigateTo({ url: '/pages/login/login' })
  } else {
    uni.navigateTo({ url: '/pages/profile/profile' })
  }
}

function logout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success(res) {
      if (res.confirm) {
        clearCurrentUser()
        user.value = null
        uni.showToast({ title: '已退出登录', icon: 'none' })
      }
    }
  })
}

function goMyPosts() {
  if (!requireLogin()) return
  uni.navigateTo({ url: '/pages/my-posts/my-posts' })
}

function goFavorites() {
  if (!requireLogin()) return
  uni.navigateTo({ url: '/pages/favorites/favorites' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/settings/settings' })
}
</script>

<style scoped>
.page { padding: 20rpx; padding-bottom: 160rpx; }
.user-card { background: #fff; border-radius: 16rpx; padding: 30rpx; display: flex; align-items: center; }
.avatar { width: 110rpx; height: 110rpx; border-radius: 50%; background: #e6f4fb; text-align: center; line-height: 110rpx; font-size: 60rpx; }
.user-info { flex: 1; margin-left: 24rpx; display: flex; flex-direction: column; }
.nickname { font-size: 34rpx; font-weight: bold; }
.slogan { font-size: 24rpx; color: #999; }
.menu { background: #fff; border-radius: 16rpx; margin-top: 20rpx; padding: 0 24rpx; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 26rpx 0; border-bottom: 1rpx solid #f0f0f0; font-size: 28rpx; }
.menu-item:last-child { border-bottom: none; }
.arrow { color: #ccc; font-size: 36rpx; }
</style>
