<template>
  <div class="usim_order_popup_main_container">
    <div class="fixed-header">
      <p class="title">유심 주문</p>
      <span @click="$emit('closePopup', false)" class="material-symbols-outlined close-button"> cancel </span>
    </div>

    <div class="scrollable_content">
      <span style="font-size: 18px">주문 세부 정보</span>
      <div class="main_order_info_section">
        <div class="order_statuses">
          <div
            v-for="(status, index) in USIM_ORDER_STATUSES"
            :key="index"
            :class="['order_status', { selected: orderInfo.status === index }]"
            @click="orderInfo.status = index"
          >
            {{ status }}
          </div>
        </div>

        <div class="input_group">
          <label>수신자명</label>
          <input v-model="orderInfo.receiverName" readonly />
        </div>

        <div class="input_group">
          <label>연락처</label>
          <CleaveInput
            placeholder="010-1234-5678"
            v-model="orderInfo.phoneNumber"
            :options="cleavePatterns.phoneNumberPattern"
            readonly
          />
        </div>

        <div class="input_group" style="width: 500px">
          <label>매장주소</label>
          <input v-bind:value="orderInfo.fullAddress" @click="openAddressPopup" placeholder="" readonly />
        </div>
      </div>
      <span style="font-size: 18px">USIM 종류</span>

      <div class="usim_order_type_list_item" v-for="(item, index) in usimOrderTypeList" :key="index">
        <span style="font-weight: 600; color: #ccc; font-size: 15px">주문 유형 {{ index + 1 }}</span>

        <div class="usim_order_type_list_item_row">
          <div class="input_groups">
            <label>대리점</label>
            <input :value="AGENT_CODES?.[item.agent_code]" readonly />
          </div>
          <div class="input_groups">
            <label>통신망</label>
            <input :value="CARRIER_CODES?.[item.carrier_type_code]" readonly />
          </div>
          <div class="input_groups">
            <label> 통신사</label>
            <input :value="MVNO_CODES?.[item?.mvno_code]" readonly />
          </div>
          <div class="input_groups">
            <label>유심 수량 </label>
            <input :value="item.usim_count" readonly />
          </div>
        </div>
      </div>

      <div class="input_group" style="width: 500px">
        <label>코멘트</label>
        <input v-model="orderInfo.senderComment" @click="openAddressPopup" />
      </div>

      <button style="align-self: flex-end; min-width: 150px" @click="updateStatus">수정 저장</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { AGENT_CODES, CARRIER_CODES, MVNO_CODES, USIM_ORDER_STATUSES } from '@/assets/constants' //used, don't delete

const emit = defineEmits(['closePopup'])
const props = defineProps({ orderId: { type: String, required: true } })

const orderInfo = reactive({
  receiverName: '',
  phoneNumber: '',
  fullAddress: '',
  status: '',
  senderComment: ''
})

const usimOrderTypeList = ref([])

// fetch order if order id is given
async function fetchOrderInfo() {
  try {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: props.orderId,
        access_token: accessToken
      })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response?.status}`)
    const decodedResponse = await response.json()

    orderInfo.fullAddress = decodedResponse?.address + decodedResponse?.address_details
    orderInfo.receiverName = decodedResponse?.receiver_name
    orderInfo.phoneNumber = decodedResponse?.phone_number
    orderInfo.status = decodedResponse?.status
    orderInfo.senderComment = decodedResponse?.sender_comment

    usimOrderTypeList.value = decodedResponse?.order_items ?? []

    console.log(decodedResponse)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

async function updateStatus() {
  // console.log(orderInfo?.senderComment)

  const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        order_id: props.orderId,
        new_status: orderInfo?.status ?? 'confirmed',
        sender_comment: orderInfo?.senderComment
      })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response?.status}`)
    const decodedResponse = await response.json()

    if (decodedResponse?.success) emit('closePopup', true)
  } catch (error) {
    console.error('Error updating data:', error)
  }
}

onMounted(fetchOrderInfo)
</script>

<style scoped>
.usim_order_popup_main_container {
  background-color: var(--main-background-color);
  border-radius: 8px;
  width: 850px;
  display: flex;
  flex-flow: column;
  /* margin: 20px; */
  /* height: fit-content; */
  align-self: center;
  max-width: 95%;
  max-height: 95%;
}

.scrollable_content {
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 30px;
  overflow-y: auto;
}

.main_order_info_section {
  display: flex;
  flex-flow: column;
  gap: 20px;
}

.input_group {
  width: 250px;
}

.order_statuses {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
}

.order_status {
  padding: 8px 15px;
  background-color: #e5e5e5;
  border-radius: 4px;
  border: 1px solid #adadad;
  cursor: pointer;
  user-select: none;
  min-width: 70px;
  text-align: center;
  font-weight: 500;
}

.order_status.selected {
  background-color: var(--main-color);
  border-color: var(--main-color);
  color: #fff;
}

.order_status:hover {
  filter: brightness(0.9);
}

.usim_order_type_list_item {
  border: 2px dashed #cdcdcd;
  border-radius: 6px;
  padding: 20px;
  padding-top: 10px;
  box-sizing: border-box;

  display: flex;
  flex-flow: column;
  gap: 10px;
  position: relative;
}

.usim_order_type_list_item_row {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
}
</style>
