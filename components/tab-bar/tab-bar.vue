<template>
  <view class="tab-bar">
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tab-item"
      :class="{ 'is-publish': item.key === 'publish' }"
      @tap="onSwitch(item)"
    >
      <!-- 中间凸起的发布按钮 -->
      <view v-if="item.key === 'publish'" class="publish-ball">+</view>

      <!-- 普通 tab -->
      <template v-else>
        <view class="icon-wrap">
          <text class="tab-icon">{{ item.icon }}</text>
          <view v-if="item.key === 'message' && unread > 0" class="badge">{{ unread > 99 ? '99+' : unread }}</view>
        </view>
        <text class="tab-text" :class="{ active: current === item.key }">{{ item.text }}</text>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// 未读互动消息数来自数据库：GET /api/users/me/notifications/unread
import { apiUnreadCount } from '../../utils/api'
import { getCurrentUser, requireLogin } from '../../utils/store'

const props = defineProps({
  current: { type: String, default: 'home' }
})

const unread = ref(0)

/** 未读角标：登录后向后端要真实未读数 */
async function refreshUnread() {
  if (!getCurrentUser()) {
    unread.value = 0
    return
  }
  try {
    const data = await apiUnreadCount()
    unread.value = data.unreadCount || 0
  } catch (e) {
    // 未登录 / 网络异常时不显示角标
  }
}

onMounted(() => {
  refreshUnread()
  // 消息页标记已读后会发这个事件，角标立即清零，无需再请求
  uni.$on('unreadChange', (n) => { unread.value = n })
})
onBeforeUnmount(() => {
  uni.$off('unreadChange')
})

const tabs = [
  { key: 'home', text: '首页', icon: '🏠', url: '/pages/home/home' },
  { key: 'enter', text: '进吧', icon: '🧭', url: '/pages/enter/enter' },
  { key: 'publish', text: '', icon: '', url: '/pages/publish/publish' },
  { key: 'message', text: '消息', icon: '💬', url: '/pages/message/message' },
  { key: 'my', text: '我的', icon: '👤', url: '/pages/my/my' }
]

function onSwitch(item) {
  if (item.key === props.current) return
  if (item.key === 'publish' && !requireLogin()) return
  uni.reLaunch({ url: item.url })
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #ffffff;
  display: flex;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.tab-icon { font-size: 40rpx; line-height: 1; }
.icon-wrap { position: relative; }
.badge { position: absolute; top: -10rpx; right: -18rpx; min-width: 28rpx; height: 28rpx; line-height: 28rpx; padding: 0 6rpx; background: #ff3b30; color: #fff; font-size: 18rpx; border-radius: 14rpx; text-align: center; box-sizing: border-box; }
.tab-text { font-size: 22rpx; color: #999999; margin-top: 6rpx; }
.tab-text.active { color: #1296db; }

/* 中间发布按钮：蓝色圆球凸起 */
.is-publish { position: relative; }
.publish-ball {
  width: 96rpx;
  height: 96rpx;
  background: #1296db;
  color: #ffffff;
  font-size: 64rpx;
  font-weight: 300;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  position: relative;
  top: -30rpx;
  box-shadow: 0 6rpx 18rpx rgba(18, 150, 219, 0.45);
}
</style>
