<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input class="search-input" v-model="keyword" placeholder="搜索帖子 / 吧 / 用户" confirm-type="search" @confirm="doSearch" focus />
      <text v-if="keyword" class="search-clear" @tap="clearKeyword">×</text>
      <text class="search-btn" @tap="doSearch">搜索</text>
    </view>

    <!-- 未输入关键词：显示历史 + 热门 -->
    <view v-if="!keyword.trim()">
      <view v-if="history.length" class="section">
        <view class="section-head">
          <text class="section-title">搜索历史</text>
          <text class="section-op" @tap="clearHistory">清空</text>
        </view>
        <view class="tag-list">
          <view class="tag" v-for="h in history" :key="h" @tap="tapKeyword(h)">{{ h }}</view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="tag-list">
          <view class="tag hot" v-for="h in hotWords" :key="h" @tap="tapKeyword(h)">{{ h }}</view>
        </view>
      </view>
    </view>

    <!-- 已输入关键词：显示结果 -->
    <view v-else class="result">
      <view v-if="result.length === 0" class="empty">未找到相关帖子</view>
      <view v-for="p in result" :key="p.id" class="post-card" @tap="goDetail(p)">
        <view class="pc-head">
          <text class="pc-bar">{{ p.barIcon }} {{ p.barName }}</text>
          <text class="pc-time">{{ p.time }}</text>
        </view>
        <view class="pc-title">
          <text v-for="(seg, i) in highlight(p.title)" :key="i" :class="{ hl: seg.hit }">{{ seg.text }}</text>
        </view>
        <view class="pc-content">{{ p.content }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { searchPosts, getSearchHistory, addSearchHistory, clearSearchHistory } from '../../utils/store'

const keyword = ref('')
const result = ref([])
const history = ref([])
const hotWords = ['前端', 'Vue3', '面试', '美食', '游戏', '读书']

let timer = null

// 输入防抖：停止输入 300ms 后实时搜索
watch(keyword, (v) => {
  if (timer) clearTimeout(timer)
  const kw = v.trim()
  if (!kw) {
    result.value = []
    return
  }
  timer = setTimeout(() => {
    result.value = searchPosts(kw)
  }, 300)
})

onShow(() => {
  history.value = getSearchHistory()
})

// 按回车 / 点搜索按钮：存历史并立即搜索
function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  addSearchHistory(kw)
  history.value = getSearchHistory()
  result.value = searchPosts(kw)
}

function clearKeyword() {
  keyword.value = ''
  result.value = []
}

function tapKeyword(h) {
  keyword.value = h
  doSearch()
}

function clearHistory() {
  clearSearchHistory()
  history.value = []
}

function goDetail(p) {
  uni.navigateTo({ url: '/pages/detail/detail?id=' + p.id })
}

// 关键词高亮：把标题按关键词切分成命中/未命中片段
function highlight(text) {
  const kw = keyword.value.trim()
  if (!kw) return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const k = kw.toLowerCase()
  const segs = []
  let idx = 0
  let i = lower.indexOf(k)
  while (i !== -1) {
    if (i > idx) segs.push({ text: text.slice(idx, i), hit: false })
    segs.push({ text: text.slice(i, i + k.length), hit: true })
    idx = i + k.length
    i = lower.indexOf(k, idx)
  }
  if (idx < text.length) segs.push({ text: text.slice(idx), hit: false })
  return segs.length ? segs : [{ text, hit: false }]
}
</script>

<style scoped>
.page { background: #f5f6f7; min-height: 100vh; padding-bottom: 60rpx; }
.search-box { display: flex; align-items: center; background: #fff; padding: 16rpx 20rpx; position: sticky; top: 0; z-index: 10; }
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; background: #f5f6f7; border-radius: 40rpx; padding: 14rpx 24rpx; font-size: 26rpx; }
.search-clear { font-size: 40rpx; color: #ccc; padding: 0 12rpx; }
.search-btn { font-size: 28rpx; color: #1296db; padding-left: 12rpx; }

.section { padding: 24rpx 20rpx 0; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 28rpx; font-weight: bold; color: #333; }
.section-op { font-size: 24rpx; color: #999; }
.tag-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag { background: #fff; border-radius: 30rpx; padding: 10rpx 28rpx; font-size: 26rpx; color: #666; }
.tag.hot { color: #ff2d55; background: #fff5f6; }

.result { padding: 20rpx; }
.empty { text-align: center; color: #999; padding: 100rpx 0; }
.post-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }
.pc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.pc-bar { font-size: 24rpx; color: #576b95; }
.pc-time { font-size: 22rpx; color: #bbb; }
.pc-title { font-size: 30rpx; font-weight: bold; color: #222; line-height: 1.4; }
.pc-title .hl { color: #ff2d55; }
.pc-content { font-size: 26rpx; color: #666; margin-top: 12rpx; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
</style>
