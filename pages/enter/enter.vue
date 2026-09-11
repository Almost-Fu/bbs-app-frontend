<template>
  <view class="page">
    <!-- 顶部导航：搜索栏 -->
    <view class="head" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-bar" @tap="onSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索帖子 / 吧</text>
      </view>
    </view>

    <!-- 足迹栏：横向滚动头像（带红角标） -->
    <view class="footprint-section">
      <view class="footprint-title">足迹</view>
      <scroll-view v-if="footprints.length" class="footprint-scroll" scroll-x :show-scrollbar="false">
        <view class="footprint-item" v-for="f in footprints" :key="f.id" @tap="goBar(f)">
          <view class="fp-avatar">
            <image class="fp-img" :src="f.img || barImgOf(f.barId)" mode="aspectFill" />
            <view v-if="f.badge > 0" class="fp-badge">{{ f.badge }}</view>
          </view>
          <text class="fp-name">{{ f.name }}</text>
        </view>
      </scroll-view>
      <view v-else-if="!isLogin" class="login-tip" @tap="goLogin">登录后查看足迹</view>
      <view v-else class="empty-tip">还没有足迹，去逛逛下面的贴吧就会留下记录</view>
    </view>

    <!-- 关注的吧：两列网格 -->
    <view class="follow-section">
      <view class="section-title">关注的吧</view>
      <view v-if="followBars.length" class="follow-grid">
        <view class="follow-item" v-for="b in followBars" :key="b.id" @tap="goBar(b)">
          <image class="follow-icon" :src="barImgOf(b.id)" mode="aspectFill" />
          <view class="follow-info">
            <text class="follow-name">{{ b.name }}</text>
            <text class="follow-desc">{{ b.desc }}</text>
          </view>
        </view>
      </view>
      <view v-else-if="!isLogin" class="login-tip" @tap="goLogin">登录后查看关注的吧</view>
      <view v-else class="empty-tip">还没有关注的吧，点进下面的吧单就能关注</view>
    </view>

    <!-- 吧单：集合分为两列，卡片为“最新帖子图片 + 吧头像 + 吧名”（瀑布流拼合，上下不留空） -->
    <view class="group" v-for="g in barGroups" :key="g.id">
      <view class="section-title">{{ g.title }}</view>
      <view class="waterfall-box" :class="{ collapsed: !g.expanded }">
        <view class="waterfall">
          <view class="waterfall-col">
            <view class="bar-card" v-for="b in leftBars(g)" :key="b.id" @tap="goBar(b)">
              <image class="bar-img" :src="barImgOf(b.id)" mode="widthFix" />
              <view class="bar-card-footer">
                <image class="bar-card-icon" :src="barImgOf(b.id)" mode="aspectFill" />
                <text class="bar-card-name">{{ b.name }}</text>
              </view>
            </view>
          </view>
          <view class="waterfall-col">
            <view class="bar-card" v-for="b in rightBars(g)" :key="b.id" @tap="goBar(b)">
              <image class="bar-img" :src="barImgOf(b.id)" mode="widthFix" />
              <view class="bar-card-footer">
                <image class="bar-card-icon" :src="barImgOf(b.id)" mode="aspectFill" />
                <text class="bar-card-name">{{ b.name }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 折叠时：羽化遮罩 + 展开按钮（压在卡片上） -->
        <view v-if="!g.expanded && g.bars.length > g.limit" class="more-mask">
          <view class="more-btn" @tap="toggleGroup(g)">
            <text class="more-text">展开更多</text>
            <text class="more-arrow">▼</text>
          </view>
        </view>
      </view>
      <!-- 展开时：收起按钮（独立一行） -->
      <view v-if="g.expanded && g.bars.length > g.limit" class="more-collapse" @tap="toggleGroup(g)">
        <text class="more-text">收起</text>
        <text class="more-arrow">▲</text>
      </view>
    </view>

    <tab-bar current="enter" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
// 进吧页数据全部来自数据库：贴吧列表 / 我关注的吧 / 我的足迹
import { apiBars, apiFollowedBars, apiFootprints } from '../../utils/api'
import { getCurrentUser } from '../../utils/store'

// 状态栏高度（H5 为 0，App/小程序用于适配刘海屏）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

// 足迹 / 关注的吧 / 全部贴吧（全部来自后端）
const footprints = ref([])
const followBars = ref([])
const allBars = ref([])
// 是否已登录：用来区分「游客」与「已登录但还没有足迹 / 关注」（两种都是空数组，但提示文案不同）
const isLogin = ref(false)

// 吧单：集合只声明"包含哪些吧"（按数据库返回的顺序切分），吧名 / 吧图统一取接口结果
const GROUP_DEFS = [
  { id: 1, title: '热门推荐', limit: 4, from: 0, to: 8 },
  { id: 2, title: '兴趣圈', limit: 4, from: 8, to: 16 }
]

const barGroups = ref(
  GROUP_DEFS.map(g => ({ id: g.id, title: g.title, limit: g.limit, expanded: false, bars: [] }))
)

/** 贴吧列表到位后按分组切分 */
function rebuildGroups() {
  barGroups.value = GROUP_DEFS.map(g => ({
    id: g.id,
    title: g.title,
    limit: g.limit,
    expanded: false,
    bars: allBars.value.slice(g.from, g.to).map(b => ({ id: b.id, name: b.name, img: b.img }))
  }))
}

async function load() {
  // 1) 全部贴吧（数据来自数据库，含吧图；同时会填好 api.js 里的吧图缓存）
  try {
    allBars.value = (await apiBars()) || []
  } catch (e) {
    allBars.value = []
  }
  rebuildGroups()

  // 2) 登录态：游客只看吧单（足迹与关注的吧需要登录）
  const me = getCurrentUser()
  isLogin.value = !!me
  if (!me) {
    footprints.value = []
    followBars.value = []
    return
  }

  // 3) 我的足迹（footprints 表）/ 我关注的吧（follows 表）
  try {
    footprints.value = await apiFootprints(10, { silent: true })
  } catch (e) {
    footprints.value = []
  }
  try {
    const bars = await apiFollowedBars({ silent: true })
    followBars.value = (bars || []).map(b => ({ id: b.id, name: b.name, img: b.img, desc: '已关注' }))
  } catch (e) {
    followBars.value = []
  }
}

onShow(() => load())

// 吧图：按吧 id 从已加载的数据库结果里取
function barImgOf(id) {
  const b = allBars.value.find(x => x.id === id)
  return b ? b.img : ''
}

// 进入吧内页（足迹项带的是 barId，贴吧项带的是 id，这里统一取）
function goBar(b) {
  const barId = b.barId || b.id
  uni.navigateTo({ url: '/pages/bar/bar?id=' + barId + '&name=' + b.name })
}

// 瀑布流左右分列（奇偶分配，卡片上下拼合不留空）
// 折叠时也渲染全部贴吧，由固定高度容器 + overflow:hidden 裁剪，被裁剪的贴吧自然露出"半截"
function leftBars(g) {
  return g.bars.filter((_, i) => i % 2 === 0)
}
function rightBars(g) {
  return g.bars.filter((_, i) => i % 2 === 1)
}

function toggleGroup(g) {
  g.expanded = !g.expanded
}

function onSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}
</script>

<style scoped>
.page { background: #f5f6f7; padding-bottom: 160rpx; }

/* 顶部导航：搜索栏 */
.head { position: sticky; top: 0; z-index: 100; background: #fff; padding: 0 20rpx 16rpx; border-bottom: 1rpx solid #f0f0f0; }
.search-bar { display: flex; align-items: center; background: #f5f6f7; padding: 14rpx 24rpx; border-radius: 40rpx; margin-top: 12rpx; }
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-placeholder { font-size: 26rpx; color: #999; }

/* 足迹栏（紧凑：缩小头像与间距，控制在半屏内） */
.footprint-section { background: #fff; padding: 16rpx 0; margin-bottom: 16rpx; }
.footprint-title { font-size: 28rpx; font-weight: bold; padding: 0 20rpx; margin-bottom: 12rpx; }
.footprint-scroll { white-space: nowrap; }
/* 隐藏横向滚动条 */
.footprint-scroll ::v-deep ::-webkit-scrollbar { display: none; width: 0; height: 0; }
.footprint-item { display: inline-flex; flex-direction: column; align-items: center; width: 100rpx; margin: 0 10rpx; }
.footprint-item:first-child { margin-left: 20rpx; }
.fp-avatar { position: relative; width: 60rpx; height: 60rpx; border-radius: 50%; background: #f0f7fc; display: flex; align-items: center; justify-content: center; }
.fp-img { width: 100%; height: 100%; border-radius: 50%; display: block; }
.fp-badge { position: absolute; top: -4rpx; right: -6rpx; min-width: 24rpx; height: 24rpx; line-height: 24rpx; padding: 0 6rpx; background: #ff3b30; color: #fff; font-size: 18rpx; border-radius: 12rpx; text-align: center; box-sizing: border-box; }
.fp-name { font-size: 20rpx; color: #666; margin-top: 6rpx; max-width: 100rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 关注的吧（紧凑：缩小图标与内边距，控制在半屏内） */
.follow-section { padding: 0 20rpx; }
.section-title { font-size: 30rpx; font-weight: bold; margin: 10rpx 6rpx 16rpx; }
.follow-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.follow-item { flex: 0 0 calc(50% - 6rpx); box-sizing: border-box; background: #fff; border-radius: 16rpx; padding: 16rpx; display: flex; align-items: center; }
.follow-icon { width: 56rpx; height: 56rpx; border-radius: 12rpx; display: block; flex-shrink: 0; }
.follow-info { flex: 1; margin-left: 12rpx; display: flex; flex-direction: column; }
.follow-name { font-size: 26rpx; font-weight: bold; color: #333; }
.follow-desc { font-size: 20rpx; color: #999; margin-top: 4rpx; }

/* 吧单：瀑布流两列卡片（图片 + 吧头像 + 吧名，上下拼合不留空） */
.group { padding: 0 20rpx; margin-top: 20rpx; }
.waterfall { display: flex; gap: 16rpx; align-items: flex-start; }
.waterfall-col { flex: 1; display: flex; flex-direction: column; gap: 16rpx; }
.bar-card { box-sizing: border-box; background: #fff; border-radius: 16rpx; overflow: hidden; }
.bar-img { width: 100%; display: block; }
.bar-card-footer { display: flex; align-items: center; padding: 16rpx; }
.bar-card-icon { width: 64rpx; height: 64rpx; border-radius: 12rpx; display: block; flex-shrink: 0; }
.bar-card-name { font-size: 26rpx; font-weight: bold; color: #333; margin-left: 12rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.waterfall-box { position: relative; }
.waterfall-box.collapsed { height: 960rpx; overflow: hidden; }
/* 折叠时：羽化遮罩（从透明渐变到页面背景色）+ 展开按钮压在卡片上 */
.more-mask { position: absolute; left: 0; right: 0; bottom: 0; height: 160rpx; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 20rpx; background: linear-gradient(to bottom, rgba(245,246,247,0) 0%, rgba(245,246,247,0.85) 70%, rgba(245,246,247,1) 100%); }
.more-btn { display: flex; align-items: center; justify-content: center; background: #fff; border: 1rpx solid #eee; border-radius: 40rpx; padding: 12rpx 40rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08); }
.more-text { font-size: 26rpx; color: #1296db; }
.more-arrow { font-size: 20rpx; color: #1296db; margin-left: 8rpx; }
/* 展开时：收起按钮（独立一行） */
.more-collapse { margin-top: 16rpx; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 16rpx; padding: 20rpx 0; }

/* 未登录提示 */
.login-tip { padding: 30rpx 20rpx; text-align: center; color: #1296db; font-size: 26rpx; background: #f0f7fc; border-radius: 12rpx; }

/* 已登录但还没有数据（不是权限问题，只是空）：灰色、不可点 */
.empty-tip { padding: 30rpx 20rpx; text-align: center; color: #999; font-size: 26rpx; background: #f5f6f7; border-radius: 12rpx; }
</style>
