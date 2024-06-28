<template>
  <div class="container">
    <template v-if="useSignUpstore().signupStep === 'initial'">
      <SignupInitialContent />
    </template>

    <template v-if="useSignUpstore().signupStep === 'secondary'">
      <SignupSecondaryContent />
    </template>
  </div>
</template>

<script setup>
import SignupInitialContent from '../components/SignupInitialContent.vue'
import SignupSecondaryContent from '../components/SignupSecondaryContent.vue'
import { useSignUpstore } from '../stores/signup-store'
</script>

<style scoped>
.container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow-y: auto;
}
@media (max-width: 600px) {
  .container {
    background-color: #fff;
  }
}
</style>
