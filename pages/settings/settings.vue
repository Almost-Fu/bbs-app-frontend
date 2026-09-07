<template>
  <view class="page">
    <view class="card">
      <view class="row" @tap="clearHistory">
        <text>清空搜索历史</text>
        <text class="arrow">›</text>
      </view>
      <view class="row" @tap="resetData">
        <text>重置本地数据</text>
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
import { initStore, clearSearchHistory } from '../../utils/store'

function clearHistory() {
  clearSearchHistory()
  uni.showToast({ title: '已清空搜索历史', icon: 'none' })
}

function resetData() {
  uni.showModal({
    title: '提示',
    content: '将清空所有本地数据（帖子、收藏、关注、登录状态等），确定吗？',
    success(res) {
      if (res.confirm) {
        uni.clearStorageSync()
        initStore()
        uni.showToast({ title: '已重置', icon: 'none' })
      }
    }
  })
}

function about() {
  uni.showModal({
    title: '关于',
    content: '这是一个 uni-app + Vue3 的贴吧社区练习项目，数据存储在本地，用于演示前端功能。',
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
