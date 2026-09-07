<template>
  <view class="card" @tap="onTap">
    <view class="title">{{ post.title }}</view>
    <view class="brief">{{ post.content }}</view>
    <view class="meta">
      <text class="author">✍ {{ post.author }}</text>
      <text class="stat">👍 {{ post.likes }}</text>
      <text class="stat">💬 {{ post.replies }}</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  post: { type: Object, required: true }
})
const emit = defineEmits(['click'])

function onTap() {
  emit('click', props.post)
}
</script>

<style scoped>
.card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }
.title { font-size: 32rpx; font-weight: bold; color: #222; }
.brief { font-size: 26rpx; color: #666; margin: 12rpx 0; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.meta { display: flex; align-items: center; font-size: 24rpx; color: #999; }
.author { flex: 1; }
.stat { margin-left: 24rpx; }
</style>
