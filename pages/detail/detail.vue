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
        <view class="author-wrap">
          <image class="author-avatar" :src="avatarUrl(post.authorAvatar)" mode="aspectFill" />
          <text class="author">{{ post.author }}</text>
        </view>
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
        <image class="c-avatar" :src="avatarUrl(c.authorAvatar)" mode="aspectFill" />
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
// 详情页数据全部走线上后端（utils/api.js → utils/request.js → Render 接口）
import {
  apiPostDetail, apiComments, apiAddComment, apiLikeComment, apiUnlikeComment,
  apiLikePost, apiUnlikePost, apiFavoritePost, apiUnfavoritePost,
  apiForwardPost, apiVisitBar, normalizePost, avatarUrl
} from '../../utils/api'
import { requireLogin } from '../../utils/store'

const post = ref({})
const comments = ref([])
const newComment = ref('')
const isFav = ref(false)
let postId = 0

// 评论总数以帖子自身的 commentCount 为准（后端发表评论时会自增，避免重复计数）
const totalComments = computed(() => post.value.commentCount || 0)

/** 拉取帖子详情 + 评论列表 */
async function load() {
  try {
    const p = await apiPostDetail(postId) // 注意：后端会顺手把浏览量 +1
    post.value = normalizePost(p)
    isFav.value = !!p.favorited

    // 看帖子也算逛过这个吧：顺手把足迹写进数据库（失败静默，不影响阅读）
    if (p.barId) apiVisitBar(p.barId).catch(() => {})

    const data = await apiComments(postId)
    comments.value = data.list || []
  } catch (e) {
    // 帖子不存在（404）等情况由请求层统一提示
  }
}

onLoad((options) => {
  postId = Number(options.id)
  load()
})

/** 帖子点赞 / 取消点赞 */
async function like() {
  if (!requireLogin()) return
  try {
    const res = post.value.liked ? await apiUnlikePost(postId) : await apiLikePost(postId)
    post.value.liked = res.liked
    post.value.likes = res.likes
  } catch (e) {
    // 请求层已提示
  }
}

/** 转发：走后端 POST /posts/{id}/forward，转发数由数据库维护 */
async function forward() {
  if (!requireLogin()) return
  try {
    const res = await apiForwardPost(postId)
    post.value.forwards = res.forwards
    uni.showToast({ title: '转发成功', icon: 'none' })
  } catch (e) {
    // 错误提示已由请求层处理
  }
}

/** 收藏 / 取消收藏 */
async function onToggleFavorite() {
  if (!requireLogin()) return
  try {
    const res = isFav.value ? await apiUnfavoritePost(postId) : await apiFavoritePost(postId)
    isFav.value = res.favorited
    uni.showToast({ title: res.favorited ? '已收藏' : '已取消收藏', icon: 'none' })
  } catch (e) {
    // 请求层已提示
  }
}

function previewImages(i) {
  uni.previewImage({ current: post.value.images[i], urls: post.value.images })
}

/** 发表评论（后端会把该帖 commentCount +1，并返回新建的评论对象） */
async function sendComment() {
  if (!requireLogin()) return
  const text = newComment.value.trim()
  if (!text) {
    uni.showToast({ title: '评论不能为空', icon: 'none' })
    return
  }
  try {
    const created = await apiAddComment(postId, text)
    comments.value = comments.value.concat(created)
    post.value.commentCount = (post.value.commentCount || 0) + 1
    newComment.value = ''
    uni.showToast({ title: '评论成功', icon: 'none' })
  } catch (e) {
    // 请求层已提示
  }
}

/** 评论点赞 / 取消点赞 */
async function onLikeComment(c) {
  if (!requireLogin()) return
  try {
    const res = c.liked ? await apiUnlikeComment(c.id) : await apiLikeComment(c.id)
    c.liked = res.liked
    c.likes = res.likes
  } catch (e) {
    // 请求层已提示
  }
}
</script>

<style scoped>
.page { padding: 20rpx; padding-bottom: 140rpx; }
.post { background: #fff; border-radius: 16rpx; padding: 24rpx; }
.author-line { display: flex; justify-content: space-between; align-items: center; font-size: 24rpx; color: #999; }
.author-wrap { display: flex; align-items: center; min-width: 0; }
.author-avatar { width: 44rpx; height: 44rpx; border-radius: 50%; margin-right: 12rpx; display: block; flex-shrink: 0; }
.c-avatar { width: 56rpx; height: 56rpx; border-radius: 50%; margin-right: 16rpx; display: block; flex-shrink: 0; }
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
