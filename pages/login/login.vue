<template>
  <view class="page">
    <view class="form-card">
      <view class="form-title">登录</view>

      <view class="field">
        <text class="label">用户名</text>
        <input class="input" v-model="username" placeholder="请输入用户名" maxlength="20" />
      </view>

      <view class="field">
        <text class="label">密码</text>
        <input class="input" v-model="password" password placeholder="请输入密码" maxlength="20" />
      </view>

      <button class="btn" @tap="onLogin">登 录</button>

      <view class="to-register" @tap="goRegister">没有账号？去注册</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getUsers, setCurrentUser } from '../../utils/store'

const username = ref('')
const password = ref('')

function onLogin() {
  const name = username.value.trim()
  const pwd = password.value

  if (!name) return uni.showToast({ title: '请输入用户名', icon: 'none' })
  if (!pwd) return uni.showToast({ title: '请输入密码', icon: 'none' })

  const users = getUsers()
  const user = users.find(u => u.username === name)
  if (!user) return uni.showToast({ title: '账号不存在，请先注册', icon: 'none' })
  if (user.password !== pwd) return uni.showToast({ title: '密码错误', icon: 'none' })

  setCurrentUser({ username: user.username, nickname: user.nickname, avatar: user.avatar || '🙂' })
  uni.showToast({ title: '登录成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 800)
}

function goRegister() {
  uni.redirectTo({ url: '/pages/register/register' })
}
</script>

<style scoped>
.page { padding: 40rpx 32rpx; padding-bottom: 160rpx; }
.form-card { background: #fff; border-radius: 16rpx; padding: 40rpx 32rpx; }
.form-title { font-size: 40rpx; font-weight: bold; text-align: center; margin-bottom: 40rpx; }
.field { margin-bottom: 28rpx; }
.label { font-size: 26rpx; color: #666; margin-bottom: 12rpx; display: block; }
.input { background: #f5f6f7; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; }
.btn { margin-top: 12rpx; height: 88rpx; line-height: 88rpx; padding: 0; border-radius: 44rpx; background: linear-gradient(135deg, #ff5f3c, #ff2d55); color: #fff; font-size: 32rpx; }
.btn::after { border: none; }
.to-register { text-align: center; color: #1296db; font-size: 26rpx; margin-top: 28rpx; }
</style>
