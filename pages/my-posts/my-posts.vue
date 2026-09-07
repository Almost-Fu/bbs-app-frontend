<template>
  <view class="page">
    <view v-if="posts.length === 0" class="empty">还没有发布过帖子</view>

    <view v-for="p in posts" :key="p.id" class="post-card" @tap="goDetail(p)">
      <view class="pc-head">
        <text class="pc-bar">{{ p.barIcon }} {{ p.barName }}</text>
        <text class="pc-time">{{ p.time }}</text>
      </view>
      <view class="pc-title">{{ p.title }}</view>
      <view class="pc-content">{{ p.content }}</view>
      <view v-if="p.images && p.images.length" class="pc-imgs">
        <image v-for="(img, i) in p.images" :key="i" class="pc-img" :src="img" mode="aspectFill" />
      </view>
      <view class="pc-foot">
        <text class="pc-stat">👍 {{ p.likes }}</text>
        <text class="pc-stat">💬 {{ p.commentCount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPosts, getCurrentUser } from '../../utils/store'

const posts = ref([])

onShow(() => {
  const user = getCurrentUser()
  if (!user) {
    posts.value = []
    return
  }
  posts.value = getPosts().filter(p => p.author === (user.nickname || user.username))
})

function goDetail(p) {
  uni.navigateTo({ url: '/pages/detail/detail?id=' + p.id })
}
</script>

<style scoped>
.page { background: #f5f6f7; min-height: 100vh; padding: 20rpx; padding-bottom: 60rpx; }
.empty { text-align: center; color: #999; padding: 100rpx 0; }
.post-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }
.pc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.pc-bar { font-size: 24rpx; color: #576b95; }
.pc-time { font-size: 22rpx; color: #bbb; }
.pc-title { font-size: 30rpx; font-weight: bold; color: #222; line-height: 1.4; }
.pc-content { font-size: 26rpx; color: #666; margin-top: 12rpx; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.pc-imgs { display: flex; gap: 8rpx; margin-top: 16rpx; }
.pc-img { flex: 1; height: 160rpx; border-radius: 10rpx; background: #eee; }
.pc-foot { display: flex; margin-top: 16rpx; padding-top: 14rpx; border-top: 1rpx solid #f5f5f5; }
.pc-stat { font-size: 24rpx; color: #999; margin-right: 32rpx; }
</style>
