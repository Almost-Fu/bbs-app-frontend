<template>
  <view class="page">
    <view v-if="posts.length === 0" class="empty">还没有收藏任何帖子</view>

    <view v-for="p in posts" :key="p.id" class="post-card" @tap="goDetail(p)">
      <view class="pc-head">
        <view class="pc-bar-wrap">
          <image v-if="p.barImg" class="pc-bar-logo" :src="p.barImg" mode="aspectFill" />
          <text class="pc-bar">{{ p.barName }}</text>
        </view>
        <text class="pc-time">{{ p.time }}</text>
      </view>
      <view class="pc-title">{{ p.title }}</view>
      <view class="pc-content">{{ p.content }}</view>
      <view class="pc-foot">
        <text class="pc-stat">👍 {{ p.likes }}</text>
        <text class="pc-stat">💬 {{ p.commentCount }}</text>
        <text class="fav-btn" @tap.stop="removeFav(p)">取消收藏</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
// 我的收藏来自数据库：GET /api/users/me/favorites，取消收藏走 DELETE /api/posts/{id}/favorite
import { apiMyFavorites, apiUnfavoritePost, normalizePosts } from '../../utils/api'
import { getCurrentUser } from '../../utils/store'

const posts = ref([])
const page = ref(1)
const hasMore = ref(false)

async function load(reset = true) {
  if (!getCurrentUser()) {
    posts.value = []
    return
  }
  try {
    const data = await apiMyFavorites({ page: reset ? 1 : page.value, pageSize: 10 })
    const list = normalizePosts(data.list)
    posts.value = reset ? list : posts.value.concat(list)
    page.value = data.page
    hasMore.value = !!data.hasMore
  } catch (e) {
    if (reset) posts.value = []
  }
}

onShow(() => load(true))
onReachBottom(() => {
  if (!hasMore.value) return
  page.value += 1
  load(false)
})

function goDetail(p) {
  uni.navigateTo({ url: '/pages/detail/detail?id=' + p.id })
}

/** 取消收藏：先写数据库，成功后再从当前列表移除 */
async function removeFav(p) {
  try {
    await apiUnfavoritePost(p.id)
    posts.value = posts.value.filter((x) => x.id !== p.id)
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } catch (e) {
    // 错误提示已由请求层处理
  }
}
</script>

<style scoped>
.page { background: #f5f6f7; min-height: 100vh; padding: 20rpx; padding-bottom: 60rpx; }
.empty { text-align: center; color: #999; padding: 100rpx 0; }
.post-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }
.pc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.pc-bar-wrap { display: flex; align-items: center; min-width: 0; }
.pc-bar-logo { width: 30rpx; height: 30rpx; border-radius: 6rpx; margin-right: 8rpx; display: block; flex-shrink: 0; }
.pc-bar { font-size: 24rpx; color: #576b95; }
.pc-time { font-size: 22rpx; color: #bbb; }
.pc-title { font-size: 30rpx; font-weight: bold; color: #222; line-height: 1.4; }
.pc-content { font-size: 26rpx; color: #666; margin-top: 12rpx; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.pc-foot { display: flex; align-items: center; margin-top: 16rpx; padding-top: 14rpx; border-top: 1rpx solid #f5f5f5; }
.pc-stat { font-size: 24rpx; color: #999; margin-right: 32rpx; }
.fav-btn { margin-left: auto; font-size: 24rpx; color: #ff2d55; padding: 6rpx 24rpx; border: 1rpx solid #ff2d55; border-radius: 26rpx; }
</style>
