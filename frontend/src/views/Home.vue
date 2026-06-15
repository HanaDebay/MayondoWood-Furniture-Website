<template>
  <div class="landing">
    <div class="split-left">
      <div class="overlay">
        <div class="content">
          <img src="/images/mwflogo.png" alt="MWF Logo" />
          <h1>Mayondo Wood & Furniture Ltd</h1>
          <p id="rotatingText">{{ currentText }}</p>
          <router-link to="/login" class="btn-get-started">Get Started →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messages = [
  "Delivering quality wood and furniture solutions...",
  "Excellence in Craftsmanship.",
  "Sustainable Wood Sourcing.",
  "Your B2B Partner for Furniture Stock."
]
const currentText = ref(messages[0])
let intervalId = null

onMounted(() => {
  let i = 0
  intervalId = setInterval(() => {
    i = (i + 1) % messages.length
    currentText.value = messages[i]
  }, 3000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
@import '../assets/css/landingPage.css';
</style>