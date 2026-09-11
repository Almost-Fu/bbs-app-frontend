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

      <button class="btn" :loading="loading" @tap="onLogin">登 录</button>

      <view class="to-register" @tap="goRegister">没有账号？去注册</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { apiLogin } from '../../utils/api'
import { setToken } from '../../utils/request'
import { setCurrentUser } from '../../utils/store'

const username = ref('')
const password = ref('')
const loading = ref(false)

async function onLogin() {
  const name = username.value.trim()
  const pwd = password.value

  if (!name) return uni.showToast({ title: '请输入用户名', icon: 'none' })
  if (!pwd) return uni.showToast({ title: '请输入密码', icon: 'none' })

  loading.value = true
  try {
    // 调线上后端登录（401 用户名或密码错误 / 403 账号被禁用 / 网络异常，均由 utils/request.js 统一提示）
    const data = await apiLogin(name, pwd)
    setToken(data.token) // 保存 token，后续请求自动带上 Authorization
    setCurrentUser(data.user) // 同步登录态给其它页面（我的、侧边抽屉等沿用同一份）
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  } catch (e) {
    // 错误提示已在请求层处理，这里什么都不用做
  } finally {
    loading.value = false
  }
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
