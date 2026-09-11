<template>
  <view class="page">
    <!-- 标题 -->
    <input class="ipt" v-model="title" placeholder="请输入标题" maxlength="50" />

    <!-- 正文 -->
    <view class="content-box">
      <textarea class="area" v-model="content" placeholder="分享你的内容吧..." maxlength="2000"></textarea>
      <view class="count">{{ content.length }}/2000</view>
    </view>

    <!-- 图片九宫格 -->
    <view class="card">
      <view class="img-grid">
        <view class="img-item" v-for="(img, i) in images" :key="i">
          <image class="img" :src="img" mode="aspectFill" @tap="previewImage(i)" />
          <view class="img-del" @tap.stop="removeImage(i)">×</view>
        </view>
        <view v-if="images.length < 9" class="img-add" @tap="addImages">
          <text class="img-add-plus">＋</text>
          <text class="img-add-text">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 选择贴吧 -->
    <view class="card row" @tap="openBarPicker">
      <text class="row-label">选择贴吧</text>
      <view v-if="selectedBar" class="row-value-wrap">
        <image class="pick-logo" :src="selectedBar.img" mode="aspectFill" />
        <text class="row-value">{{ selectedBar.name }}</text>
      </view>
      <text v-else class="row-placeholder">请选择要发布的贴吧</text>
      <text class="row-arrow">›</text>
    </view>

    <!-- 话题 -->
    <view class="card">
      <view class="topic-list">
        <view v-for="t in topics" :key="t" class="topic-tag" @tap="removeTopic(t)">
          <text class="topic-text">#{{ t }}</text>
          <text class="topic-del">×</text>
        </view>
      </view>
      <view class="topic-input-box">
        <text class="topic-hash">#</text>
        <input class="topic-input" v-model="topicInput" placeholder="添加 #话题" confirm-type="done" @confirm="addTopic" />
        <view class="topic-add-btn" @tap="addTopic">添加</view>
      </view>
    </view>

    <!-- 发布 -->
    <button class="btn" @tap="submit">发布</button>

    <tab-bar current="publish" />

    <!-- 贴吧选择弹层 -->
    <view v-if="showBarPicker" class="picker-mask" @tap="closeBarPicker">
      <view class="picker-panel" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择贴吧</text>
          <text class="picker-close" @tap="closeBarPicker">×</text>
        </view>
        <view class="picker-search">
          <text class="picker-search-icon">🔍</text>
          <input class="picker-search-input" v-model="barSearchKeyword" placeholder="搜索贴吧" />
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view v-for="b in filteredBars" :key="b.id" class="picker-item" @tap="chooseBar(b)">
            <image class="picker-item-icon" :src="b.img" mode="aspectFill" />
            <text class="picker-item-name">{{ b.name }}</text>
            <text v-if="selectedBar && selectedBar.id === b.id" class="picker-item-check">✓</text>
          </view>
          <view v-if="filteredBars.length === 0" class="picker-empty">未找到相关贴吧</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
// 发布走后端：吧列表来自数据库，图片走 multipart 上传（uni.uploadFile）
import { apiBars, apiCreatePost } from '../../utils/api'
import { requireLogin } from '../../utils/store'

const title = ref('')
const content = ref('')

// 图片
const images = ref([])

// 贴吧
const selectedBar = ref(null)
const showBarPicker = ref(false)
const barSearchKeyword = ref('')

// 话题
const topics = ref([])
const topicInput = ref('')

// 可发布的贴吧列表（来自数据库）
const barList = ref([])
const submitting = ref(false)

async function loadBars() {
  try {
    barList.value = (await apiBars()) || []
  } catch (e) {
    barList.value = []
  }
}
loadBars()

const filteredBars = computed(() => {
  const kw = barSearchKeyword.value.trim()
  if (!kw) return barList.value
  return barList.value.filter((b) => b.name.includes(kw))
})

// 图片相关
function addImages() {
  const remain = 9 - images.value.length
  if (remain <= 0) return
  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    success: (res) => {
      images.value = images.value.concat(res.tempFilePaths)
    }
  })
}

function previewImage(i) {
  uni.previewImage({
    current: images.value[i],
    urls: images.value
  })
}

function removeImage(i) {
  images.value.splice(i, 1)
}

// 贴吧选择
function openBarPicker() {
  barSearchKeyword.value = ''
  showBarPicker.value = true
}

function closeBarPicker() {
  showBarPicker.value = false
}

function chooseBar(b) {
  selectedBar.value = b
  showBarPicker.value = false
}

// 话题
function addTopic() {
  const t = topicInput.value.trim().replace(/^#+/, '')
  if (!t) return
  if (topics.value.includes(t)) {
    uni.showToast({ title: '话题已添加', icon: 'none' })
    return
  }
  topics.value.push(t)
  topicInput.value = ''
}

function removeTopic(t) {
  topics.value = topics.value.filter((x) => x !== t)
}

async function submit() {
  if (!requireLogin()) return
  if (!title.value.trim()) {
    uni.showToast({ title: '标题不能为空', icon: 'none' })
    return
  }
  if (!content.value.trim()) {
    uni.showToast({ title: '内容不能为空', icon: 'none' })
    return
  }
  if (!selectedBar.value) {
    uni.showToast({ title: '请选择要发布的贴吧', icon: 'none' })
    return
  }
  if (submitting.value) return

  submitting.value = true
  uni.showLoading({ title: '发布中', mask: true })
  try {
    // 直接写数据库：文字 + 图片（multipart）一次性提交，返回新建的帖子
    await apiCreatePost({
      barId: selectedBar.value.id,
      title: title.value.trim(),
      content: content.value.trim(),
      tag: topics.value.length ? topics.value[0] : '未分类',
      filePaths: images.value
    })

    uni.hideLoading()
    uni.showToast({ title: '发布成功', icon: 'success' })

    title.value = ''
    content.value = ''
    images.value = []
    topics.value = []
    topicInput.value = ''
    selectedBar.value = null

    setTimeout(() => {
      uni.reLaunch({ url: '/pages/home/home' })
    }, 800)
  } catch (e) {
    uni.hideLoading()
    // 具体错误（标题过长 / 图片格式 / 未登录等）已由请求层提示
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page {
  padding: 12rpx;
  padding-bottom: 140rpx;
  background: #f5f6f7;
}

/* 标题输入 */
.ipt {
  background: #fff;
  border-radius: 16rpx;
  padding: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 正文 */
.content-box {
  background: #fff;
  border-radius: 16rpx;
  margin-top: 12rpx;
  padding: 12rpx;
}
.area {
  width: 100%;
  height: 140rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.count {
  text-align: right;
  color: #999;
  font-size: 24rpx;
  margin-top: 4rpx;
}

/* 通用卡片 */
.card {
  background: #fff;
  border-radius: 16rpx;
  margin-top: 12rpx;
  padding: 12rpx;
}

/* 图片九宫格 */
.img-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.img-item {
  position: relative;
  width: calc((100% - 32rpx) / 3);
  height: 110rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.img {
  width: 100%;
  height: 100%;
}
.img-del {
  position: absolute;
  top: 0;
  right: 0;
  width: 44rpx;
  height: 44rpx;
  line-height: 40rpx;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 32rpx;
  border-radius: 0 0 0 12rpx;
}
.img-add {
  width: calc((100% - 32rpx) / 3);
  height: 110rpx;
  border-radius: 12rpx;
  background: #f5f6f7;
  border: 2rpx dashed #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.img-add-plus {
  font-size: 56rpx;
  color: #bbb;
  line-height: 1;
}
.img-add-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 选择贴吧行 */
.row {
  display: flex;
  align-items: center;
}
.row-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  flex-shrink: 0;
}
.row-value {
  flex: 1;
  font-size: 28rpx;
  color: #1296db;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-value-wrap {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}
.pick-logo {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  margin-right: 10rpx;
  display: block;
  flex-shrink: 0;
}
.row-placeholder {
  flex: 1;
  margin-left: 20rpx;
  font-size: 26rpx;
  color: #bbb;
  text-align: right;
}
.row-arrow {
  font-size: 40rpx;
  color: #ccc;
  margin-left: 8rpx;
  line-height: 1;
}

/* 话题 */
.topic-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.topic-head-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.topic-head-tip {
  font-size: 22rpx;
  color: #bbb;
}
.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.topic-tag {
  display: flex;
  align-items: center;
  background: #eaf6ff;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
}
.topic-text {
  font-size: 26rpx;
  color: #1296db;
}
.topic-del {
  font-size: 26rpx;
  color: #1296db;
  margin-left: 8rpx;
}
.topic-input-box {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  background: #f5f6f7;
  border-radius: 12rpx;
  padding: 8rpx 16rpx;
}
.topic-hash {
  font-size: 28rpx;
  color: #1296db;
  font-weight: bold;
}
.topic-input {
  flex: 1;
  font-size: 26rpx;
  padding: 12rpx;
}
.topic-add-btn {
  font-size: 26rpx;
  color: #1296db;
  padding: 8rpx 16rpx;
  background: #fff;
  border-radius: 8rpx;
}
.hot-topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}
.hot-topic {
  font-size: 24rpx;
  color: #666;
  background: #f5f6f7;
  border-radius: 8rpx;
  padding: 8rpx 20rpx;
}

/* 发布按钮 */
.btn {
  margin-top: 20rpx;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #ff5f3c, #ff2d55);
  color: #fff;
  font-size: 30rpx;
}
.btn::after {
  border: none;
}

/* 贴吧选择弹层 */
.picker-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}
.picker-panel {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}
.picker-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 28rpx 24rpx 16rpx;
}
.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.picker-close {
  position: absolute;
  right: 24rpx;
  top: 20rpx;
  font-size: 44rpx;
  color: #999;
  line-height: 1;
}
.picker-search {
  display: flex;
  align-items: center;
  margin: 8rpx 24rpx 16rpx;
  background: #f5f6f7;
  border-radius: 40rpx;
  padding: 12rpx 24rpx;
}
.picker-search-icon {
  font-size: 26rpx;
  margin-right: 12rpx;
}
.picker-search-input {
  flex: 1;
  font-size: 26rpx;
}
.picker-list {
  max-height: 640rpx;
}
.picker-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.picker-item-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  display: block;
  flex-shrink: 0;
}
.picker-item-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.picker-item-check {
  font-size: 30rpx;
  color: #1296db;
  font-weight: bold;
}
.picker-empty {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 60rpx 0;
}
</style>
