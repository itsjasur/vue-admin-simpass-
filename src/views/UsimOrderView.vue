<template>
  <div class="usim_order_container">
    <div></div>

    <div class="table-part">
      <a-pagination
        class="pagination"
        size="small"
        :total="totalCount"
        :current="currentPage"
        :pageSize="rowLimit"
        show-size-changer
        :show-total="(total, range) => `${range[0]}-${range[1]} / ${total}`"
        @change="onPagChange"
      >
        <template #buildOptionText="props">
          <span>{{ props.value }} / 페이지</span>
        </template>
      </a-pagination>

      <div class="table-wrap">
        <a-table
          class="table"
          :columns="columns"
          :data-source="dataList"
          bordered
          :pagination="false"
          size="middle"
          :showSorterTooltip="false"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'full_address'">
              <span>{{ record?.address + ' ' + record?.address_details || '' }}</span>
            </template>
            <template v-if="column.dataIndex === 'status'">
              <div
                :style="{
                  backgroundColor: statusColors?.[text],
                  color: '#fff',
                  borderRadius: '30px',
                  padding: '2px 5px',
                  whiteSpace: 'nowrap'
                }"
              >
                {{ statuses?.[text] }}
              </div>
            </template>

            <template v-if="column.dataIndex === 'agent_cd'">
              <div class="order_items_content">
                <span v-for="(item, index) in record.order_items" :key="index">
                  <!-- :style="{ fontWeight: 'bold', color: getColor(index) }" -->
                  {{ AGENT_CODES?.[item?.agent_code] ?? '' }}
                </span>
              </div>
            </template>

            <template v-if="column.dataIndex === 'carrier_type_code'">
              <div class="order_items_content">
                <span v-for="(item, index) in record.order_items" :key="index">
                  {{ CARRIER_CODES?.[item?.carrier_type_code] ?? '' }}
                </span>
              </div>
            </template>

            <template v-if="column.dataIndex === 'mvno_cd'">
              <div class="order_items_content">
                <span v-for="(item, index) in record.order_items" :key="index">
                  {{ MVNO_CODES?.[item?.mvno_code] ?? '' }}
                </span>
              </div>
            </template>

            <template v-if="column.dataIndex === 'usim_count'">
              <div class="order_items_content">
                <span v-for="(item, index) in record.order_items" :key="index">
                  {{ item.usim_count }}
                </span>
              </div>
            </template>

            <template v-if="column.dataIndex === 'actions'">
              <span
                class="material-symbols-outlined edit_button"
                style="color: #3393ff"
                @click="openPopup(record?.order_id)"
              >
                edit
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
  <GlobalPopupWithOverlay ref="popupRef">
    <OrderUsimPopupContent @closePopup="closePopup" :orderId="selectedOrderId" />
  </GlobalPopupWithOverlay>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { onMounted, ref } from 'vue'
import { AGENT_CODES, CARRIER_CODES, MVNO_CODES } from '@/assets/constants' //used don't delete
import OrderUsimPopupContent from '@/components/OrderUsimPopupContent.vue'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'

// function getColor(seed) {
//   const colors = ['#0066CC', '#CC0000', '#006633', '#6600CC', '#CC6600', '#006666', '#990066']
//   if (!Number.isInteger(seed)) return colors[0]
//   const index = seed % colors.length
//   return colors[index]
// }

const statuses = {
  confirmed: '주문확인',
  shipped: '배송중',
  delivered: '발송완료',
  failed: '취소'
}
const statusColors = {
  confirmed: 'green',
  shipped: 'orange',
  delivered: 'grey',
  failed: 'red'
}

const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

//pagination change
function onPagChange(curPage, perPage) {
  currentPage.value = curPage
  rowLimit.value = perPage
  fetchData()
}

const columns = ref([
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => (a.status ?? '').localeCompare(b.status ?? ''),
    align: 'center',
    width: '100px'
  },

  {
    title: '수신자명',
    dataIndex: 'receiver_name',
    key: 'receiver_name',
    width: 120
  },
  {
    title: '종류',
    dataIndex: 'order_items',
    key: 'order_items',
    align: 'center',
    children: [
      {
        title: '대리점',
        dataIndex: 'agent_cd',
        key: 'agent_cd',
        align: 'center',
        customHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } })
      },
      {
        title: '통신망',
        dataIndex: 'carrier_type_code',
        key: 'carrier_type_code',
        align: 'center',
        customHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } })
      },
      {
        title: '통신사',
        dataIndex: 'mvno_cd',
        key: 'mvno_cd',
        align: 'center',
        customHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } })
      },
      {
        title: '유심 수량',
        dataIndex: 'usim_count',
        key: 'usim_count',
        align: 'center',
        customHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } })
      }
    ]
  },
  {
    title: '주문 날짜',
    dataIndex: 'created_at',
    key: 'created_at'
    // width: '15%',
  },
  {
    title: '연락처',
    dataIndex: 'phone_number',
    key: 'phone_number'
    // width: '10%',
  },
  {
    title: '주소',
    dataIndex: 'full_address',
    key: 'full_address'
    // width: '25%',
  },
  // {
  //   title: '코맨트',
  //   dataIndex: 'sender_comment',
  //   key: 'sender_comment'
  //   // width: '20%',
  // },
  {
    title: '수정',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center'
  }
])

const dataList = ref([])
const fetchData = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        per_page: rowLimit.value,
        page_number: currentPage.value
      })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response?.status}`)

    const decodedResponse = await response.json()
    dataList.value = decodedResponse.usim_orders
    // console.log(dataList.value)
    totalCount.value = decodedResponse.total_count
  } catch (error) {
    console.error('Error fetching orders:', error)
    useSnackbarStore().show(error.toString())
  }
}

const selectedOrderId = ref(null)
function openPopup(orderId) {
  console.log(orderId)
  selectedOrderId.value = orderId
  popupRef.value.showPopup()
}
const popupRef = ref(null)
function closePopup(shouldRefresh) {
  currentPage.value = 1
  rowLimit.value = 10
  if (shouldRefresh) fetchData()
  popupRef.value.closePopup()
}

async function tokenUpdate() {
  try {
    const response = await fetchWithTokenRefresh('admin/myInfo', { method: 'GET' })
    if (!response.ok) throw new Error('Fetch profile data error')
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

onMounted(tokenUpdate)
onMounted(fetchData)
</script>

<style scoped>
.usim_order_container {
  box-sizing: border-box;
  display: flex;
  gap: 20px;
  flex-flow: column;
}

.table-part {
  width: 100%;
  display: flex;
  flex-flow: column;
  gap: 10px;
}

.pagination {
  margin: 0 20px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.table {
  min-width: 1200px;
  max-height: 700px;
  box-sizing: border-box;
  margin: 0 20px;
  margin-bottom: 5px;
}
.table-wrap::-webkit-scrollbar {
  height: 12px;
}

.table-wrap::-webkit-scrollbar-track {
  background-color: #f8f8f8;
}

.table-wrap::-webkit-scrollbar-thumb {
  background-color: #e6e6e6;
  border-radius: 6px;
}

.table-wrap::-webkit-scrollbar-thumb:hover {
  background-color: #d4d4d4;
}

.order_items_content {
  display: flex;
  flex-flow: column;
  gap: 30px;
  word-break: keep-all;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit_button {
  cursor: pointer;
}
</style>
