<template>
  <view class="page">
    <view class="tabs">
      <view
        v-for="t in tabs" :key="t.key"
        class="tab" :class="{ active: activeTab === t.key }"
        @tap="activeTab = t.key"
      >{{ t.text }}</view>
    </view>

    <view v-if="filtered.length === 0" class="empty">暂无消息</view>

    <view v-for="m in filtered" :key="m.id" class="msg-item">
      <view class="m-avatar">{{ m.avatar }}</view>
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
import { setUnreadCount } from '../../utils/store'

const activeTab = ref('like')

const tabs = [
  { key: 'like', text: '点赞' },
  { key: 'reply', text: '回复' },
  { key: 'at', text: '@我的' }
]

// 占位数据：后续接后端接口换成真实消息
const messages = ref([
  { id: 1, type: 'like', avatar: '🧑‍💻', name: '爱折腾的程序员', action: '赞了你的帖子', content: '《uniapp 到底能不能替代原生开发？》', time: '10:23' },
  { id: 2, type: 'reply', avatar: '👩‍🎓', name: '前端小白', action: '回复了你', content: '带我一个！我也在学前端。', time: '09:15' },
  { id: 3, type: 'at', avatar: '🍜', name: '干饭人', action: '@了你', content: '这家店真的绝，改天一起去吃！', time: '昨天' },
  { id: 4, type: 'like', avatar: '📚', name: '读书吧', action: '赞了你的评论', content: '写得真好，收藏了。', time: '昨天' },
  { id: 5, type: 'reply', avatar: '🎮', name: '游戏吧', action: '回复了你', content: '周六开黑吗？', time: '3天前' }
])

const filtered = computed(() => messages.value.filter(m => m.type === activeTab.value))

onShow(() => {
  setUnreadCount(0)
  uni.$emit('unreadChange', 0)
})
</script>

<style scoped>
.page { padding-bottom: 160rpx; }
.tabs { display: flex; background: #fff; position: sticky; top: 0; z-index: 10; }
.tab { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; position: relative; }
.tab.active { color: #1296db; font-weight: bold; }
.tab.active::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 48rpx; height: 6rpx; border-radius: 3rpx; background: #1296db; }
.msg-item { background: #fff; margin: 16rpx 20rpx; border-radius: 16rpx; padding: 24rpx; display: flex; }
.m-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #f0f7fc; text-align: center; line-height: 80rpx; font-size: 40rpx; flex-shrink: 0; }
.m-body { flex: 1; margin-left: 20rpx; }
.m-title { font-size: 26rpx; color: #333; }
.m-name { color: #1296db; font-weight: bold; margin-right: 10rpx; }
.m-action { color: #666; }
.m-content { font-size: 26rpx; color: #666; background: #f5f6f7; border-radius: 10rpx; padding: 14rpx 18rpx; margin-top: 12rpx; }
.m-time { font-size: 22rpx; color: #bbb; margin-top: 10rpx; }
.empty { text-align: center; color: #999; padding: 100rpx 0; }
</style>
