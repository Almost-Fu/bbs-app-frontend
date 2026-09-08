<template>
  <view class="page">
    <!-- 帖子正文 -->
    <view class="post">
      <view class="bar-line">
        <image v-if="post.barImg" class="bar-logo" :src="post.barImg" mode="aspectFill" />
        <text class="bar-name">{{ post.barName }}</text>
        <text v-if="post.tag" class="bar-tag">{{ post.tag }}</text>
      </view>
      <view class="title">{{ post.title }}</view>
      <view class="author-line">
        <text class="author">{{ post.authorAvatar }} {{ post.author }}</text>
        <text class="time">{{ post.time }}</text>
      </view>
      <view class="content">{{ post.content }}</view>

      <!-- 图片 -->
      <view v-if="post.images && post.images.length" class="imgs">
        <image v-for="(img, i) in post.images" :key="i" class="img" :src="img" mode="widthFix" @tap="previewImages(i)" />
      </view>

      <!-- 操作栏 -->
      <view class="op-bar">
        <view class="op" @tap="like">
          <text class="op-icon">👍</text>
          <text class="op-num" :class="{ liked: post.liked }">{{ post.likes }}</text>
        </view>
        <view class="op" @tap="forward">
          <text class="op-icon">🔁</text>
          <text class="op-num">{{ post.forwards }}</text>
        </view>
        <view class="op" @tap="onToggleFavorite">
          <text class="op-icon">{{ isFav ? '⭐' : '☆' }}</text>
          <text class="op-num">{{ isFav ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="comment-title">评论（{{ totalComments }}）</view>
    <view v-for="c in comments" :key="c.id" class="comment">
      <view class="c-head">
        <text class="c-avatar">{{ c.authorAvatar }}</text>
        <view class="c-info">
          <text class="c-name">{{ c.author }}</text>
          <text class="c-time">{{ c.time }}</text>
        </view>
      </view>
      <text class="c-text">{{ c.text }}</text>
      <view class="c-like" @tap="onLikeComment(c)">
        <text class="c-like-icon">{{ c.liked ? '👍' : '👍🏻' }}</text>
        <text class="c-like-num">{{ c.likes }}</text>
      </view>
    </view>
    <view v-if="comments.length === 0" class="empty">还没有评论，快来抢沙发～</view>

    <!-- 底部评论输入 -->
    <view class="footer">
      <input class="c-ipt" v-model="newComment" placeholder="说点什么..." confirm-type="send" @confirm="sendComment" />
      <button class="c-btn" size="mini" @tap="sendComment">发送</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  getPost, getComments, addComment, likeComment, likePost, forwardPost,
  toggleFavorite, isFavorite, getCurrentUser, requireLogin
} from '../../utils/store'

const post = ref({})
const comments = ref([])
const newComment = ref('')
const isFav = ref(false)

const totalComments = computed(() => (post.value.commentCount || 0) + comments.value.length)

onLoad((options) => {
  const id = Number(options.id)
  const p = getPost(id)
  if (p) {
    post.value = p
    isFav.value = isFavorite(id)
  }
  comments.value = getComments(id)
})

function like() {
  if (!requireLogin()) return
  const updated = likePost(post.value.id)
  if (updated) {
    post.value.liked = updated.liked
    post.value.likes = updated.likes
  }
}

function forward() {
  if (!requireLogin()) return
  const updated = forwardPost(post.value.id)
  if (updated) post.value.forwards = updated.forwards
  uni.showToast({ title: '转发成功', icon: 'none' })
}

function onToggleFavorite() {
  if (!requireLogin()) return
  const fav = toggleFavorite(post.value.id)
  isFav.value = fav
  uni.showToast({ title: fav ? '已收藏' : '已取消收藏', icon: 'none' })
}

function previewImages(i) {
  uni.previewImage({ current: post.value.images[i], urls: post.value.images })
}

function sendComment() {
  if (!requireLogin()) return
  const text = newComment.value.trim()
  if (!text) {
    uni.showToast({ title: '评论不能为空', icon: 'none' })
    return
  }
  const user = getCurrentUser()
  const comment = {
    id: Date.now(),
    author: user ? (user.nickname || user.username) : '游客',
    authorAvatar: (user && user.avatar) || '🙂',
    text,
    time: '刚刚',
    likes: 0,
    liked: false
  }
  addComment(post.value.id, comment)
  comments.value = getComments(post.value.id)
  newComment.value = ''
}

function onLikeComment(c) {
  if (!requireLogin()) return
  const updated = likeComment(post.value.id, c.id)
  if (updated) {
    c.liked = updated.liked
    c.likes = updated.likes
  }
}
</script>

<style scoped>
.page { padding: 20rpx; padding-bottom: 140rpx; }
.post { background: #fff; border-radius: 16rpx; padding: 24rpx; }
.author-line { display: flex; justify-content: space-between; font-size: 24rpx; color: #999; }
.title { font-size: 38rpx; font-weight: bold; margin: 16rpx 0; }
.content { font-size: 28rpx; color: #444; }
.comment-title { font-size: 30rpx; font-weight: bold; margin: 30rpx 6rpx 16rpx; }
.comment { background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 16rpx; display: flex; flex-direction: column; }
.c-name { font-size: 24rpx; color: #1296db; margin-bottom: 6rpx; }
.c-text { font-size: 27rpx; }
.empty { text-align: center; color: #999; padding: 40rpx 0; }
.footer { position: fixed; left: 0; right: 0; bottom: 0; background: #fff; padding: 16rpx 20rpx calc(16rpx + env(safe-area-inset-bottom)); display: flex; align-items: center; border-top: 1rpx solid #eee; }
.c-ipt { flex: 1; background: #f5f6f7; border-radius: 40rpx; padding: 12rpx 24rpx; font-size: 26rpx; }
.c-btn { margin-left: 16rpx; background: #1296db; color: #fff; }

.bar-line { display: flex; align-items: center; margin-bottom: 12rpx; }
.bar-logo { width: 34rpx; height: 34rpx; border-radius: 8rpx; margin-right: 10rpx; display: block; flex-shrink: 0; }
.bar-name { font-size: 24rpx; color: #576b95; font-weight: bold; }
.bar-tag { font-size: 20rpx; color: #1296db; background: #eaf6ff; padding: 4rpx 16rpx; border-radius: 8rpx; margin-left: 12rpx; }
.imgs { margin-top: 20rpx; }
.img { width: 100%; border-radius: 12rpx; margin-bottom: 12rpx; }
.op-bar { display: flex; margin-top: 24rpx; padding-top: 20rpx; border-top: 1rpx solid #f2f2f2; }
.op { flex: 1; display: flex; align-items: center; justify-content: center; }
.op-icon { font-size: 30rpx; }
.op-num { font-size: 24rpx; color: #999; margin-left: 8rpx; }
.op-num.liked { color: #1296db; }
.c-head { display: flex; align-items: center; }
.c-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: #f0f7fc; text-align: center; line-height: 64rpx; font-size: 34rpx; flex-shrink: 0; }
.c-info { flex: 1; margin-left: 16rpx; display: flex; flex-direction: column; }
.c-time { font-size: 22rpx; color: #bbb; }
.c-like { align-self: flex-end; display: flex; align-items: center; margin-top: 8rpx; }
.c-like-icon { font-size: 26rpx; }
.c-like-num { font-size: 22rpx; color: #999; margin-left: 6rpx; }
</style>
