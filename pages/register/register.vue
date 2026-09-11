<template>
  <view class="page">
    <view class="form-card">
      <view class="form-title">注册账号</view>

      <view class="field">
        <text class="label">用户名</text>
        <input class="input" v-model="username" placeholder="请输入用户名（2-20个字符）" maxlength="20" />
      </view>

      <view class="field">
        <text class="label">昵称</text>
        <input class="input" v-model="nickname" placeholder="请输入昵称（选填）" maxlength="20" />
      </view>

      <view class="field">
        <text class="label">密码</text>
        <input class="input" v-model="password" password placeholder="请输入密码（至少6位）" maxlength="20" />
      </view>

      <view class="field">
        <text class="label">确认密码</text>
        <input class="input" v-model="confirmPassword" password placeholder="请再次输入密码" maxlength="20" />
      </view>

      <button class="btn" :loading="loading" @tap="onRegister">注 册</button>

      <view class="to-login" @tap="goLogin">已有账号？去登录</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { apiRegister } from '../../utils/api'
import { setToken } from '../../utils/request'
import { setCurrentUser } from '../../utils/store'

const username = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function onRegister() {
  const name = username.value.trim()
  const nick = nickname.value.trim() || name
  const pwd = password.value
  const confirm = confirmPassword.value

  if (!name) return uni.showToast({ title: '请输入用户名', icon: 'none' })
  if (name.length < 2) return uni.showToast({ title: '用户名至少2个字符', icon: 'none' })
  if (!pwd) return uni.showToast({ title: '请输入密码', icon: 'none' })
  if (pwd.length < 6) return uni.showToast({ title: '密码至少6位', icon: 'none' })
  if (pwd !== confirm) return uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })

  loading.value = true
  try {
    // 后端注册：用户名重复会返回 400（提示由请求层统一处理），成功即返回 token
    // 头像不传：后端会用内置默认头像图（/static/avatars/default.png），数据库里不存 emoji
    const data = await apiRegister({ username: name, password: pwd, nickname: nick })
    setToken(data.token)
    setCurrentUser(data.user)
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/my/my' })
    }, 800)
  } catch (e) {
    // 错误提示已在请求层处理
  } finally {
    loading.value = false
  }
}

function goLogin() {
  uni.redirectTo({ url: '/pages/login/login' })
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
.to-login { text-align: center; color: #1296db; font-size: 26rpx; margin-top: 28rpx; }
</style>
