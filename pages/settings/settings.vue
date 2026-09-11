<template>
  <view class="page">
    <view class="card">
      <view class="row" @tap="clearHistory">
        <text>清空搜索历史</text>
        <text class="arrow">›</text>
      </view>
      <view class="row" @tap="resetData">
        <text>清除本机缓存（含登录状态）</text>
        <text class="arrow">›</text>
      </view>
      <view class="row" @tap="about">
        <text>关于</text>
        <text class="arrow">›</text>
      </view>
    </view>
    <view class="version">贴吧社区 · 练习项目 v1.0.0</view>
  </view>
</template>

<script setup>
import { clearSearchHistory, clearCurrentUser } from '../../utils/store'
import { clearToken } from '../../utils/request'

function clearHistory() {
  clearSearchHistory()
  uni.showToast({ title: '已清空搜索历史', icon: 'none' })
}

function resetData() {
  uni.showModal({
    title: '提示',
    content: '将清除本机的登录状态与搜索历史。帖子、收藏、关注等数据都保存在服务器上，不受影响。确定吗？',
    success(res) {
      if (res.confirm) {
        uni.clearStorageSync()
        clearToken()
        clearCurrentUser()
        uni.showToast({ title: '已清除本机缓存', icon: 'none' })
      }
    }
  })
}

function about() {
  uni.showModal({
    title: '关于',
    content: '这是一个 uni-app + Vue3 的贴吧社区项目：数据全部由后端接口提供（FastAPI + MySQL），App 端只负责展示与交互。',
    showCancel: false
  })
}
</script>

<style scoped>
.page { background: #f5f6f7; min-height: 100vh; padding: 20rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 0 24rpx; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 0; border-bottom: 1rpx solid #f0f0f0; font-size: 28rpx; }
.row:last-child { border-bottom: none; }
.arrow { color: #ccc; font-size: 36rpx; }
.version { text-align: center; color: #bbb; font-size: 24rpx; margin-top: 40rpx; }
</style>
