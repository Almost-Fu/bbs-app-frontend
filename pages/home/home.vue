<template>
  <view class="page">
    <!-- 自定义顶部导航：汉堡菜单 + 搜索栏 -->
    <view class="head" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="head-row">
        <view class="hamburger" @tap="onMenu">
          <view class="line"></view>
          <view class="line"></view>
          <view class="line"></view>
        </view>
        <view class="search-bar" @tap="onSearch">
          <text class="search-icon">🔍</text>
          <text class="search-placeholder">搜索帖子 / 吧</text>
        </view>
      </view>
    </view>

    <!-- 帖子信息流 -->
    <view v-for="p in posts" :key="p.id" class="card" @tap="goDetail(p)">
      <!-- 吧名 -->
      <view class="card-head">
        <text class="bar-icon">{{ p.barIcon }}</text>
        <text class="bar-name">{{ p.barName }}</text>
        <view class="follow-btn" :class="{ followed: p.followed }" @tap.stop="toggleFollow(p)">
          {{ p.followed ? '已关注' : '+ 关注' }}
        </view>
      </view>

      <!-- 标题 -->
      <view class="card-title">{{ p.title }}</view>

      <!-- 正文摘要 -->
      <view class="card-content">{{ p.content }}</view>

      <!-- 配图：单张大图 -->
      <view v-if="p.images.length === 1" class="img-single">
        <image class="img-single-item" :src="p.images[0]" mode="widthFix" @tap.stop="previewImages(p, 0)" />
      </view>
      <!-- 配图：多图网格 -->
      <view v-else-if="p.images.length > 1" class="img-grid">
        <image v-for="(img, i) in p.images" :key="i" class="img-grid-item" :src="img" mode="aspectFill" @tap.stop="previewImages(p, i)" />
      </view>

      <!-- 底部操作栏 -->
      <view class="card-foot">
        <view class="action" @tap.stop="like(p)">
          <text class="action-icon">👍</text>
          <text class="action-num" :class="{ liked: p.liked }">{{ p.likes }}</text>
        </view>
        <view class="action" @tap.stop="goDetail(p)">
          <text class="action-icon">💬</text>
          <text class="action-num">{{ p.commentCount }}</text>
        </view>
        <view class="action" @tap.stop="forward(p)">
          <text class="action-icon">🔁</text>
          <text class="action-num">{{ p.forwards }}</text>
        </view>
        <view class="action" @tap.stop="onToggleFavorite(p)">
          <text class="action-icon">{{ isFav(p.id) ? '⭐' : '☆' }}</text>
          <text class="action-num">收藏</text>
        </view>
      </view>
    </view>

    <view v-if="posts.length === 0" class="empty">暂无内容</view>

    <tab-bar current="home" />

    <!-- 侧边抽屉 -->
    <view class="drawer-mask" :class="{ show: showDrawer }" @tap="closeDrawer" @touchmove.stop.prevent></view>
    <view class="drawer" :class="{ open: showDrawer }">
      <view class="drawer-user" :style="{ paddingTop: statusBarHeight + 24 + 'px' }" @tap="onDrawerUserTap">
        <view class="drawer-avatar">{{ user ? '😊' : '🙂' }}</view>
        <view class="drawer-user-info">
          <text class="drawer-name">{{ user ? user.nickname : '游客' }}</text>
          <text class="drawer-sub">{{ user ? '欢迎回来，' + user.username : '点击登录 / 注册' }}</text>
        </view>
        <text class="drawer-arrow">›</text>
      </view>

      <scroll-view class="drawer-body" scroll-y>
        <view class="drawer-section">
          <view class="drawer-title">足迹</view>
          <scroll-view v-if="footprints.length" class="fp-scroll" scroll-x :show-scrollbar="false">
            <view class="fp-item" v-for="f in footprints" :key="f.id" @tap="goBar(f)">
              <view class="fp-avatar">
                <text class="fp-icon">{{ f.icon }}</text>
                <view v-if="f.badge > 0" class="fp-badge">{{ f.badge }}</view>
              </view>
              <text class="fp-name">{{ f.name }}</text>
            </view>
          </scroll-view>
          <view v-else class="login-tip" @tap="goLogin">登录后查看足迹</view>
        </view>

        <view class="drawer-section">
          <view class="drawer-title">我的关注</view>
          <view v-if="followBars.length">
            <view class="follow-item" v-for="b in followBars" :key="b.id" @tap="goBar(b)">
              <view class="follow-icon">{{ b.icon }}</view>
              <view class="follow-info">
                <text class="follow-name">{{ b.name }}</text>
                <text class="follow-desc">{{ b.desc }}</text>
              </view>
            </view>
          </view>
          <view v-else class="login-tip" @tap="goLogin">登录后查看关注的吧</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getPosts, likePost, forwardPost, toggleFavorite, isFavorite, isFollowedBar, toggleFollowBar, getFollowedBars, getBars, getFootprints, getCurrentUser, requireLogin } from '../../utils/store'

// 状态栏高度（H5 为 0，App/小程序用于适配刘海屏）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

// 占位数据：后续接后端接口换成真实帖子
// images 为网络占位图，可按需替换
const posts = ref([])

// 侧边抽屉
const showDrawer = ref(false)
const user = ref(null)

// 足迹：最近浏览的吧（游客为空，登录后展示）
const footprints = ref([])

// 我的关注（从 store 读取，联动关注状态）
const followBars = ref([])

function load() {
  posts.value = getPosts().map(p => ({ ...p, followed: isFollowedBar(p.barId) }))
  user.value = getCurrentUser()
  footprints.value = getFootprints()
  followBars.value = getFollowedBars().map(id => {
    const b = getBars().find(x => x.id === id)
    return b ? { id: b.id, icon: b.icon, name: b.name, desc: '已关注' } : null
  }).filter(Boolean)
}

load()

onShow(load)

onPullDownRefresh(() => {
  load()
  setTimeout(() => uni.stopPullDownRefresh(), 500)
})

function goDetail(p) {
  uni.navigateTo({ url: '/pages/detail/detail?id=' + p.id })
}

function goBar(b) {
  closeDrawer()
  uni.navigateTo({ url: '/pages/bar/bar?id=' + b.id + '&name=' + b.name })
}

function goLogin() {
  closeDrawer()
  uni.navigateTo({ url: '/pages/login/login' })
}

function toggleFollow(p) {
  if (!requireLogin()) return
  toggleFollowBar(p.barId)
  p.followed = !p.followed
  load()
}

function like(p) {
  if (!requireLogin()) return
  const updated = likePost(p.id)
  if (updated) {
    p.liked = updated.liked
    p.likes = updated.likes
  }
}

function onToggleFavorite(p) {
  if (!requireLogin()) return
  const fav = toggleFavorite(p.id)
  uni.showToast({ title: fav ? '已收藏' : '已取消收藏', icon: 'none' })
}

function isFav(id) {
  return isFavorite(id)
}

function forward(p) {
  if (!requireLogin()) return
  const updated = forwardPost(p.id)
  if (updated) p.forwards = updated.forwards
  uni.showToast({ title: '转发成功', icon: 'none' })
}

function previewImages(p, i) {
  uni.previewImage({ current: p.images[i], urls: p.images })
}

function onMenu() {
  user.value = getCurrentUser()
  showDrawer.value = true
}

function closeDrawer() {
  showDrawer.value = false
}

function onDrawerUserTap() {
  if (!user.value) {
    showDrawer.value = false
    uni.navigateTo({ url: '/pages/login/login' })
  }
}

function onSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}
</script>

<style scoped>
.page { padding-bottom: 160rpx; }

/* 自定义顶部导航：汉堡菜单 + 搜索栏 */
.head { position: sticky; top: 0; z-index: 100; background: #fff; padding: 0 20rpx 12rpx; border-bottom: 1rpx solid #f0f0f0; }
.head-row { display: flex; align-items: center; padding-top: 12rpx; }
.hamburger { width: 60rpx; height: 60rpx; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; margin-right: 20rpx; }
.line { width: 40rpx; height: 4rpx; background: #333; border-radius: 2rpx; margin: 4rpx 0; }
.search-bar { flex: 1; display: flex; align-items: center; background: #f5f6f7; padding: 14rpx 24rpx; border-radius: 40rpx; }
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-placeholder { font-size: 26rpx; color: #999; }

/* 帖子卡片 */
.card { background: #fff; margin: 0 20rpx 20rpx; border-radius: 16rpx; padding: 24rpx; }
.card-head { display: flex; align-items: center; margin-bottom: 16rpx; }
.bar-icon { font-size: 32rpx; margin-right: 12rpx; }
.bar-name { flex: 1; font-size: 26rpx; color: #576b95; font-weight: bold; }
.follow-btn { padding: 6rpx 26rpx; border: 1rpx solid #1296db; color: #1296db; border-radius: 30rpx; font-size: 24rpx; }
.follow-btn.followed { border-color: #dddddd; color: #999; }

.card-title { font-size: 32rpx; font-weight: bold; color: #222; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.card-content { font-size: 26rpx; color: #666; line-height: 1.6; margin: 12rpx 0; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

/* 配图 */
.img-single { margin-top: 8rpx; }
.img-single-item { width: 100%; border-radius: 12rpx; }
.img-grid { display: flex; margin-top: 12rpx; }
.img-grid-item { flex: 1; height: 210rpx; border-radius: 8rpx; }
.img-grid-item + .img-grid-item { margin-left: 8rpx; }

/* 底部操作栏 */
.card-foot { display: flex; align-items: center; margin-top: 20rpx; padding-top: 16rpx; border-top: 1rpx solid #f2f2f2; }
.action { flex: 1; display: flex; align-items: center; justify-content: center; }
.action-icon { font-size: 30rpx; margin-right: 8rpx; }
.action-num { font-size: 24rpx; color: #999; }
.action-num.liked { color: #1296db; }

.empty { text-align: center; color: #999; padding: 100rpx 0; }

/* 侧边抽屉 */
.drawer-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.drawer-mask.show { opacity: 1; visibility: visible; }

.drawer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 66.66%;
  background: #fff;
  z-index: 1001;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.drawer.open { transform: translateX(0); }

.drawer-user {
  display: flex;
  align-items: center;
  padding: 0 24rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}
.drawer-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #e6f4fb;
  text-align: center;
  line-height: 96rpx;
  font-size: 52rpx;
  flex-shrink: 0;
}
.drawer-user-info { flex: 1; margin-left: 20rpx; display: flex; flex-direction: column; }
.drawer-name { font-size: 32rpx; font-weight: bold; }
.drawer-sub { font-size: 24rpx; color: #999; margin-top: 4rpx; }
.drawer-arrow { font-size: 40rpx; color: #ccc; }

.drawer-body { flex: 1; height: 0; }

.drawer-section { padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.drawer-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }

/* 足迹横向滚动 */
.fp-scroll { white-space: nowrap; }
.fp-scroll ::v-deep ::-webkit-scrollbar { display: none; }
.fp-item { display: inline-flex; flex-direction: column; align-items: center; width: 100rpx; margin-right: 20rpx; }
.fp-avatar { position: relative; width: 64rpx; height: 64rpx; border-radius: 50%; background: #f0f7fc; display: flex; align-items: center; justify-content: center; }
.fp-icon { font-size: 34rpx; }
.fp-badge { position: absolute; top: -4rpx; right: -6rpx; min-width: 24rpx; height: 24rpx; line-height: 24rpx; padding: 0 6rpx; background: #ff3b30; color: #fff; font-size: 18rpx; border-radius: 12rpx; text-align: center; box-sizing: border-box; }
.fp-name { font-size: 20rpx; color: #666; margin-top: 6rpx; max-width: 100rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 我的关注列表 */
.follow-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f7f7f7; }
.follow-item:last-child { border-bottom: none; }
.follow-icon { width: 56rpx; height: 56rpx; border-radius: 12rpx; background: #f0f7fc; text-align: center; line-height: 56rpx; font-size: 30rpx; flex-shrink: 0; }
.follow-info { flex: 1; margin-left: 16rpx; display: flex; flex-direction: column; }
.follow-name { font-size: 26rpx; font-weight: bold; color: #333; }
.follow-desc { font-size: 20rpx; color: #999; margin-top: 4rpx; }

/* 未登录提示 */
.login-tip { padding: 30rpx 20rpx; text-align: center; color: #1296db; font-size: 26rpx; background: #f0f7fc; border-radius: 12rpx; }
</style>
