<template>
  <view class="page">
    <!-- 顶部：渐变导航栏 + 吧信息区（连成一片红色渐变） -->
    <view class="header-wrap" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 导航栏 -->
      <view class="nav-bar">
        <view class="nav-btn" @tap="goBack">
          <text class="nav-back">‹</text>
        </view>
        <view class="nav-search" @tap="onSearch">
          <text class="nav-search-icon">🔍</text>
          <text class="nav-search-text">搜索吧内帖子</text>
        </view>
        <view class="nav-btn" @tap="onShare">
          <text class="nav-share">↗</text>
        </view>
      </view>

      <!-- 吧信息区 -->
      <view class="bar-header">
        <view class="bar-avatar">
          <image class="bar-avatar-img" :src="barInfo.img" mode="aspectFill" />
        </view>
        <view class="bar-main">
          <view class="bar-name-row">
            <text class="bar-name">{{ barInfo.name }}</text>
            <text class="bar-owner">吧主：{{ barInfo.owner }}</text>
          </view>
          <view class="bar-stats">
            <text class="stat">帖子 {{ barInfo.posts }}</text>
            <text class="stat-dot">·</text>
            <text class="stat">关注 {{ barInfo.members }}</text>
          </view>
        </view>
        <view class="follow-btn" :class="{ followed: barInfo.followed }" @tap="toggleFollow">
          {{ barInfo.followed ? '已关注' : '+ 关注' }}
        </view>
      </view>
    </view>

    <!-- 帖子列表 -->
    <view class="post-list">
      <view class="post-card" v-for="p in posts" :key="p.id" @tap="goDetail(p)">
        <!-- 用户信息 -->
        <view class="post-user">
          <view class="user-avatar">{{ p.authorAvatar }}</view>
          <text class="user-name">{{ p.author }}</text>
          <text class="post-time">{{ p.time }}</text>
        </view>

        <!-- 分类标签 -->
        <view class="post-tag">{{ p.tag }}</view>

        <!-- 标题 -->
        <text class="post-title">{{ p.title }}</text>

        <!-- 正文（2 行截断） -->
        <text class="post-content">{{ p.content }}</text>

        <!-- 多图预览 -->
        <view v-if="p.images && p.images.length" class="post-images">
          <image
            v-for="(img, i) in p.images"
            :key="i"
            class="post-img"
            :src="img"
            mode="aspectFill"
            @tap.stop="previewImages(p, i)"
          />
        </view>

        <!-- 底部操作 -->
        <view class="post-actions">
          <view class="action" @tap.stop="forward(p)">
            <text class="action-icon">🔁</text>
            <text class="action-num">{{ p.forwards }}</text>
          </view>
          <view class="action" @tap.stop="goDetail(p)">
            <text class="action-icon">💬</text>
            <text class="action-num">{{ p.commentCount }}</text>
          </view>
          <view class="action" @tap.stop="toggleLike(p)">
            <text class="action-icon">{{ p.liked ? '❤️' : '🤍' }}</text>
            <text class="action-num" :class="{ liked: p.liked }">{{ p.likes }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="posts.length === 0" class="empty">该吧暂无帖子，快来发第一帖吧～</view>

    <!-- 悬浮发帖按钮（红色圆形加号） -->
    <view class="fab" @tap="goPublish">
      <text class="fab-plus">＋</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPostsByBar, likePost, forwardPost, toggleFollowBar, isFollowedBar, getBar, requireLogin } from '../../utils/store'

// 状态栏高度（H5 为 0，App/小程序用于适配刘海屏）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

// 吧信息
const barInfo = ref({
  img: '',
  name: '前端吧',
  owner: '阿华',
  posts: '2.3万',
  members: '1.2万',
  followed: false
})

// 接收上一页传入的吧 id 与吧名
let barId = 1

onLoad((options) => {
  if (options.id) barId = Number(options.id)
  const bar = getBar(barId)
  if (bar) {
    barInfo.value.name = bar.name
    barInfo.value.img = bar.img
  }
  barInfo.value.followed = isFollowedBar(barId)
  posts.value = getPostsByBar(barId)
})

// 吧内帖子列表（白色圆角卡片）
const posts = ref([])

function goBack() {
  uni.navigateBack()
}

function onSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

function onShare() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function toggleFollow() {
  if (!requireLogin()) return
  barInfo.value.followed = toggleFollowBar(barId)
}

function forward(p) {
  if (!requireLogin()) return
  const updated = forwardPost(p.id)
  if (updated) p.forwards = updated.forwards
  uni.showToast({ title: '转发成功', icon: 'none' })
}

function goDetail(p) {
  uni.navigateTo({ url: '/pages/detail/detail?id=' + p.id })
}

function toggleLike(p) {
  if (!requireLogin()) return
  const updated = likePost(p.id)
  if (updated) {
    p.liked = updated.liked
    p.likes = updated.likes
  }
}

function previewImages(p, i) {
  uni.previewImage({ current: p.images[i], urls: p.images })
}

function goPublish() {
  if (!requireLogin()) return
  uni.navigateTo({ url: '/pages/publish/publish' })
}
</script>

<style scoped>
.page { background: #f5f6f7; min-height: 100vh; padding-bottom: 160rpx; }

/* 顶部渐变 + 吧信息 */
.header-wrap { background: linear-gradient(135deg, #ff5f3c, #ff2d55); }
.nav-bar { display: flex; align-items: center; padding: 16rpx 24rpx; }
.nav-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-back { font-size: 56rpx; color: #fff; line-height: 1; }
.nav-share { font-size: 40rpx; color: #fff; }
.nav-search { flex: 1; margin: 0 16rpx; background: rgba(255,255,255,0.28); border-radius: 40rpx; padding: 12rpx 24rpx; display: flex; align-items: center; }
.nav-search-icon { font-size: 26rpx; margin-right: 10rpx; }
.nav-search-text { font-size: 26rpx; color: #fff; opacity: 0.9; }

.bar-header { display: flex; align-items: center; padding: 8rpx 24rpx 32rpx; }
.bar-avatar { width: 110rpx; height: 110rpx; border-radius: 20rpx; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.bar-avatar-img { width: 100%; height: 100%; border-radius: 20rpx; display: block; }
.bar-main { flex: 1; margin-left: 24rpx; }
.bar-name-row { display: flex; align-items: baseline; }
.bar-name { font-size: 38rpx; font-weight: bold; color: #fff; }
.bar-owner { font-size: 22rpx; color: rgba(255,255,255,0.85); margin-left: 16rpx; }
.bar-stats { display: flex; align-items: center; margin-top: 12rpx; }
.stat { font-size: 24rpx; color: rgba(255,255,255,0.9); }
.stat-dot { font-size: 24rpx; color: rgba(255,255,255,0.7); margin: 0 12rpx; }
.follow-btn { background: #fff; color: #ff2d55; font-size: 26rpx; padding: 12rpx 32rpx; border-radius: 32rpx; flex-shrink: 0; }
.follow-btn.followed { background: rgba(255,255,255,0.3); color: #fff; }

/* 帖子列表 */
.post-list { padding: 20rpx; }
.post-card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 20rpx; }
.post-user { display: flex; align-items: center; }
.user-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: #f0f7fc; font-size: 36rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name { font-size: 26rpx; color: #333; margin-left: 16rpx; font-weight: bold; }
.post-time { font-size: 22rpx; color: #bbb; margin-left: auto; }

.post-tag { display: inline-block; margin-top: 20rpx; font-size: 22rpx; color: #1296db; background: #eaf6ff; padding: 4rpx 16rpx; border-radius: 8rpx; }
.post-title { display: block; margin-top: 14rpx; font-size: 32rpx; font-weight: bold; color: #222; line-height: 1.4; }
.post-content { display: block; margin-top: 12rpx; font-size: 28rpx; color: #666; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

.post-images { display: flex; gap: 8rpx; margin-top: 20rpx; }
.post-img { flex: 1; height: 220rpx; border-radius: 12rpx; background: #eee; }

.post-actions { display: flex; margin-top: 24rpx; padding-top: 20rpx; border-top: 1rpx solid #f5f5f5; }
.action { flex: 1; display: flex; align-items: center; justify-content: center; }
.action-icon { font-size: 30rpx; }
.action-num { font-size: 26rpx; color: #999; margin-left: 10rpx; }
.action-num.liked { color: #ff2d55; }

/* 悬浮发帖按钮 */
.empty { text-align: center; color: #999; padding: 100rpx 0; }
.fab { position: fixed; right: 40rpx; bottom: 120rpx; width: 100rpx; height: 100rpx; border-radius: 50%; background: #ff2d55; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(255,45,85,0.4); }
.fab-plus { font-size: 60rpx; color: #fff; line-height: 1; }
</style>
