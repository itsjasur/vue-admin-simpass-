<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="innerHeader">
        <h3 class="title">요금제선택</h3>
        <span @click="popup.close" class="material-symbols-outlined close-button"> cancel </span>
      </div>

      <div class="scroll-content">
        <div class="types">
          <div
            class="button"
            v-for="(item, index) in PLANTYPES"
            :key="index"
            :class="{ selected: popup.type === item.cd }"
            @click="updateType(item.cd)"
          >
            {{ item.label }}
          </div>
        </div>

        <div class="filter-section">
          <div class="group" style="width: 200px">
            <label>통신사</label>
            <!--:getPopupContainer="(triggerNode) => triggerNode.parentNode"  shows options on top-->
            <a-select
              :getPopupContainer="(triggerNode) => triggerNode.parentNode"
              v-model:value="popup.mvnoCd"
              :style="{ width: '100%' }"
              :options="
                mvnos.map((i) => ({ value: i.mvno_cd, label: i.mvno_nm })) ?? [
                  { value: 'N/A', label: 'N/A' }
                ]
              "
            >
            </a-select>
          </div>

          <div class="group" style="width: 300px">
            <label>요금제명</label>
            <div class="inputRow">
              <input
                type="text"
                id="search"
                name="password"
                placeholder="검색할 요금제명"
                v-model="popup.searchText"
              />
              <span
                v-if="popup.searchText"
                @click="popup.searchText = ''"
                class="icon material-symbols-outlined"
              >
                close
              </span>
            </div>
          </div>
        </div>

        <a-table
          class="table"
          :columns="columns"
          :data-source="dataList"
          bordered
          :pagination="false"
          size="middle"
        >
          <template #bodyCell="{ column, text, record }">
            <template
              v-if="text && (column.dataIndex === 'basic_fee' || column.dataIndex === 'sales_fee')"
            >
              <div>{{ text?.toLocaleString() }}원</div>
            </template>

            <template v-if="column.dataIndex === 'discount_fee'">
              <span style="color: red"> {{ text?.toLocaleString() }}원 </span>
            </template>

            <template v-if="column.dataIndex === 'usim_plan_nm'">
              <span class="linkText" @click="selectPlan(record)">
                {{ text }}
              </span>
            </template>
          </template>
        </a-table>

        <div class="plan-card" v-for="(item, index) in dataList" :key="index">
          <div class="title" @click="selectPlan(item)">
            <span>{{ item.usim_plan_nm }}</span>
            <span class="icon material-symbols-outlined"> arrow_forward_ios </span>
          </div>

          <div class="body">
            <div class="data">
              <span class="icon material-symbols-outlined"> swap_vert </span>
              <span> {{ item.cell_data }}{{ item.qos }} </span>
            </div>

            <div class="calls">
              <span class="icon material-symbols-outlined"> call </span>
              <span> {{ item.voice }} </span>
            </div>

            <div class="sms">
              <span class="icon material-symbols-outlined"> mail </span>
              <span> {{ item.message }} </span>
            </div>
          </div>

          <div class="price">
            <span class="original">{{ item.basic_fee.toLocaleString() }} 원</span>
            <span class="sale"> {{ item.sales_fee.toLocaleString() }} 원/월</span>
          </div>
        </div>

        <div style="height: 100px"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '../stores/snackbar'
import { useSelectPlansPopup } from '../stores/select-plans-popup'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { PLANTYPES } from '../assets/constants'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import { useRouter } from 'vue-router'

const router = useRouter()
const popup = useSelectPlansPopup()

const dataList = ref([])

const updateType = (newType) => {
  popup.type = newType
  fetchData()
}

//watch for search text changes
watch(
  () => popup.searchText,
  (n, o) => fetchData()
)

//watch for selected mvnocd
watch(
  () => popup.mvnoCd,
  (n, o) => fetchData()
)

const selectPlan = (selectedPlan) => {
  popup.close()

  console.log(selectedPlan)

  router.push({
    name: 'form-details',
    params: { id: selectedPlan.id }
  })
}

const columns = ref([
  {
    title: '요금제명',
    dataIndex: 'usim_plan_nm',
    key: 'usim_plan_nm',
    sorter: (a, b) => (a.usim_plan_nm ?? '').localeCompare(b.usim_plan_nm), // sorter function for alphabetical sorting
    sortDirections: ['descend', 'ascend']
  },
  {
    title: '월납부금액',
    dataIndex: 'sales_fee',
    key: 'sales_fee',
    sorter: (a, b) => a.sales_fee ?? 0 - b.sales_fee ?? 0,
    align: 'end'
  },
  {
    title: '기본료',
    dataIndex: 'basic_fee',
    key: 'basic_fee',
    sorter: (a, b) => a.basic_fee ?? 0 - b.basic_fee ?? 0,
    align: 'end'
  },
  {
    title: '프로모션할인금액',
    dataIndex: 'discount_fee',
    key: 'discount_fee',
    sorter: (a, b) => a.discount_fee ?? 0 - b.discount_fee ?? 0,
    align: 'end'
  },

  {
    title: '음성',
    dataIndex: 'voice',
    key: 'voice',
    sorter: (a, b) => (a.voice ?? '').localeCompare(b.voice ?? '')
  },
  {
    title: '문자',
    dataIndex: 'message',
    key: 'message',
    sorter: (a, b) => (a.message ?? '').localeCompare(b.message ?? '')
  },
  {
    title: '데이터',
    dataIndex: 'cell_data',
    key: 'cell_data',
    sorter: (a, b) => (a.cell_data ?? '').localeCompare(b.cell_data ?? '')
  },

  {
    title: 'QOS',
    dataIndex: 'qos',
    key: 'qos',
    sorter: (a, b) => (a.qos ?? '').localeCompare(b.qos ?? '')
  }
])

const mvnos = ref([])
async function fetchMvnos() {
  try {
    const response = await fetchWithTokenRefresh('agent/applyCarrier', {
      method: 'POST',
      body: { carrier_type: popup.type, carrier_cd: popup.carrierCd }
    })

    const decodedResponse = await response.json()
    mvnos.value = decodedResponse?.data.info ?? []
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

const fetchData = async () => {
  try {
    const response = await fetchWithTokenRefresh('agent/planlist', {
      method: 'POST',
      body: {
        carrier_type: popup.type, // 선불:PR ,후불:PO
        carrier_cd: popup.carrierCd, // SKT : SK ,KT : KT,LG U+ : LG
        mvno_cd: popup.mvnoCd,
        usim_plan_nm: popup.searchText
      }
    })

    if (!response.ok) throw 'Fetch data error'

    const decodedResponse = await response.json()

    if (decodedResponse.data && decodedResponse.data.info) {
      let list = decodedResponse.data.info
      dataList.value = list
    }
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

//this handles keyboard actions
function keydownHandle(event) {
  if (event.key === 'Escape') {
    popup.close()
  }
}

onMounted(async () => {
  document.addEventListener('keydown', keydownHandle)
  fetchData()
  fetchMvnos()

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  await delay(1000)
  useSnackbarStore().hide()
  useSnackbarStore().show('가입신청  접수할 요금제를 선택해주세요', 'warning')
})

onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandle)
  popup.close()
})
</script>

<style scoped>
.overlay {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  /* width: 100vw; */
  /* height: 100vh; */
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  background-color: #0000008d;
  padding: 20px;
  z-index: 2000;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  height: 100%;
  width: 100%;
  overflow: auto;
}

@media (min-width: 1400px) {
  .popup-content {
    height: 100%;
    width: 1400px;
  }
}

.innerHeader {
  position: sticky;
  top: 0;
  height: 50px;
  padding: 0 20px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Bottom shadow */
  z-index: 2004;
}

.innerHeader .material-symbols-outlined {
  font-size: 30px;
}

.scroll-content {
  display: flex;
  flex-flow: column;
  gap: 30px;
  padding: 0 20px;
  margin-top: 20px;
}

.filter-section {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.inputRow {
  position: relative;
}

.inputRow .icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  color: #808080;
  cursor: pointer;
}

.types {
  display: flex;
  gap: 20px;
  flex-flow: wrap;
}

.button {
  min-height: 50px;
  min-width: 150px;
}

.linkText {
  color: var(--main-color);
  display: inline-flex;
  font-weight: 600;
  cursor: pointer;
}

@media (min-width: 600px) {
  .plan-card {
    display: none;
  }
}

.table {
  font-weight: 600;
}

@media (max-width: 599px) {
  .table {
    display: none;
  }

  .inputRow {
    width: 100%;
  }
  .button {
    min-width: 50px;
    flex: 1 0 calc(50% - 20px); /* each item takes half of the container width with a gap of 20px */
    max-width: calc(50% - 10px); /* ensures items don't exceed half of the container width */
  }

  .plan-card {
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    gap: 10px;
    padding: 10px;
    border: 1px solid var(--border-color);
  }

  .card:hover {
    opacity: 1;
    cursor: default;
  }

  .plan-card .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
  }

  .plan-card .title .icon {
    font-size: 20px;
    color: #797979;
    cursor: pointer;
  }

  .plan-card .body {
    display: flex;
    flex-direction: column;
    color: #707070;
    gap: 10px;
  }

  .plan-card .body div {
    display: flex;
    align-items: center;
  }

  .plan-card .body .material-symbols-outlined {
    font-variation-settings:
      'FILL' 1,
      'wght' 700,
      'opsz' 40;

    font-size: 22px;
    padding-right: 10px;
    padding-left: 5px;
    color: #afafaf;
  }

  .plan-card .price {
    align-self: flex-end;
  }
  .plan-card .price .original {
    color: #afafaf;
    text-decoration: line-through;
  }
  .plan-card .price .sale {
    padding-left: 15px;
    padding-right: 10px;
    font-weight: bold;
    color: var(--main-color);
  }
}
</style>
