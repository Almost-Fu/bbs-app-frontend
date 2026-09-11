<template>
  <view class="page">
    <view class="tabs">
      <view
        v-for="t in tabs" :key="t.key"
        class="tab" :class="{ active: activeTab === t.key }"
        @tap="switchTab(t.key)"
      >{{ t.text }}</view>
    </view>

    <view v-if="filtered.length === 0" class="empty">{{ getCurrentUser() ? '暂无消息' : '登录后查看互动消息' }}</view>

    <view v-for="m in filtered" :key="m.id" class="msg-item" @tap="goPost(m)">
      <image class="m-avatar" :src="avatarUrl(m.avatar)" mode="aspectFill" />
      <view class="m-body">
        <view class="m-title">
          <text class="m-name">{{ m.name }}</text>
          <text class="m-action">{{ m.action }}</text>
        </view>
        <view v-if="m.content" class="m-content">{{ m.content }}</view>
        <view class="m-time">{{ m.time }}</view>
      </view>
    </view>

    <tab-bar current="message" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
// 互动消息全部来自数据库：由 likes / comments 聚合而成（谁赞了我的帖、谁评论了我的帖、谁在评论里 @我）
import { apiNotifications, apiReadNotifications, avatarUrl } from '../../utils/api'
import { getCurrentUser } from '../../utils/store'

const activeTab = ref('like')

const tabs = [
  { key: 'like', text: '点赞' },
  { key: 'reply', text: '回复' },
  { key: 'at', text: '@我的' }
]

// 页面分类 → 后端消息类型
const TYPE_OF_TAB = { like: 'like', reply: 'reply', at: 'mention' }

const messages = ref([])

/** 拉取当前分类的互动消息 */
async function load() {
  if (!getCurrentUser()) {
    messages.value = []
    return
  }
  try {
    const data = await apiNotifications(TYPE_OF_TAB[activeTab.value])
    messages.value = data.list || []
  } catch (e) {
    messages.value = []
  }
}

const filtered = computed(() => messages.value)

/** 切换分类：重新向后端要这一类消息 */
function switchTab(key) {
  activeTab.value = key
  load()
}

/** 点消息跳到对应帖子 */
function goPost(m) {
  if (m.postId) uni.navigateTo({ url: '/pages/detail/detail?id=' + m.postId })
}

onShow(async () => {
  await load()
  // 进入消息页即视为已读：推进服务器端的已读位置，并通知 tab-bar 清角标
  if (getCurrentUser()) {
    try {
      await apiReadNotifications()
    } catch (e) {
      // 忽略：角标不是关键路径
    }
    uni.$emit('unreadChange', 0)
  }
})
</script>

<style scoped>
.page { padding-bottom: 160rpx; }
.tabs { display: flex; background: #fff; position: sticky; top: 0; z-index: 10; }
.tab { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; position: relative; }
.tab.active { color: #1296db; font-weight: bold; }
.tab.active::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 48rpx; height: 6rpx; border-radius: 3rpx; background: #1296db; }
.msg-item { background: #fff; margin: 16rpx 20rpx; border-radius: 16rpx; padding: 24rpx; display: flex; }
.m-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #f0f7fc; display: block; flex-shrink: 0; }
.m-body { flex: 1; margin-left: 20rpx; }
.m-title { font-size: 26rpx; color: #333; }
.m-name { color: #1296db; font-weight: bold; margin-right: 10rpx; }
.m-action { color: #666; }
.m-content { font-size: 26rpx; color: #666; background: #f5f6f7; border-radius: 10rpx; padding: 14rpx 18rpx; margin-top: 12rpx; }
.m-time { font-size: 22rpx; color: #bbb; margin-top: 10rpx; }
.empty { text-align: center; color: #999; padding: 100rpx 0; }
</style>
