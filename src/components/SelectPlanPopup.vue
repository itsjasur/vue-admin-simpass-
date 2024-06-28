<template>
  <template v-if="popup.active">
    <div class="overlay">
      <div class="popup-content">
        <div class="innerHeader">
          <h3 class="title">요금제선택</h3>
          <span @click="popup.close" class="material-symbols-outlined close-button"> cancel </span>
        </div>

        <div class="scroll-content">
          <div style="height: 30px"></div>

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
          <div style="height: 30px"></div>

          <div class="inputRow">
            <input
              type="text"
              id="search"
              name="password"
              placeholder="검색할 요금제명을 입력해주세요"
              v-model="popup.searchText"
              @input="searchTextChange()"
            />
            <span v-if="popup.searchText" @click="popup.searchText = ''" class="icon material-symbols-outlined">
              close
            </span>
          </div>
          <div style="height: 30px"></div>

          <a-table class="table" :columns="columns" :data-source="dataList" bordered :pagination="false" size="middle">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'basic_fee' || column.dataIndex === 'sales_fee'">
                <div>{{ text.toLocaleString() }}</div>
              </template>

              <template v-if="column.dataIndex === 'usim_plan_nm'">
                <span class="linkText" @click="selectPlan(record)">
                  {{ text }}
                </span>
              </template>
            </template>
          </a-table>

          <div class="card" v-for="(item, index) in dataList" :key="index">
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
</template>

<script setup>
import { useSnackbarStore } from '../stores/snackbar'
import { useSelectPlansPopup } from '../stores/select-plans-popup'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { PLANTYPES } from '../assets/constants'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import { useRouter } from 'vue-router'

// const props = defineProps({
//   type: { type: String, requierd: true },
//   carrierCd: { type: String, requierd: true },
//   mvnoCd: { type: String, requierd: true },
// })

const router = useRouter()
const popup = useSelectPlansPopup()

const dataList = ref([])

const updateType = (newType) => {
  popup.type = newType
  fetchData()
}

const searchTextChange = () => {
  fetchData()
}

const selectPlan = (selectedPlan) => {
  popup.close()

  router.push({
    name: 'form-details',
    params: { id: selectedPlan.id },
  })
}

const columns = ref([
  {
    title: '요금제명',
    dataIndex: 'usim_plan_nm',
    key: 'usim_plan_nm',
    sorter: (a, b) => (a.usim_plan_nm ?? '').localeCompare(b.usim_plan_nm), // sorter function for alphabetical sorting
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: '기본금액 (월)',
    dataIndex: 'basic_fee',
    key: 'basic_fee',
    sorter: (a, b) => a.basic_fee ?? 0 - b.basic_fee ?? 0,
  },
  {
    title: '판매금액 (월)',
    dataIndex: 'sales_fee',
    key: 'sales_fee',
    sorter: (a, b) => a.sales_fee ?? 0 - b.sales_fee ?? 0,
  },

  {
    title: '음성',
    dataIndex: 'voice',
    key: 'voice',
    sorter: (a, b) => (a.voice ?? '').localeCompare(b.voice ?? ''),
  },
  {
    title: '문자',
    dataIndex: 'message',
    key: 'message',
    sorter: (a, b) => (a.message ?? '').localeCompare(b.message ?? ''),
  },
  {
    title: '데이터',
    dataIndex: 'cell_data',
    key: 'cell_data',
    sorter: (a, b) => (a.cell_data ?? '').localeCompare(b.cell_data ?? ''),
  },

  {
    title: 'QOS',
    dataIndex: 'qos',
    key: 'qos',
    sorter: (a, b) => (a.qos ?? '').localeCompare(b.qos ?? ''),
  },
])

const fetchData = async () => {
  try {
    const response = await fetchWithTokenRefresh('agent/planlist', {
      method: 'POST',
      body: {
        carrier_type: popup.type, // 선불:PR ,후불:PO
        carrier_cd: popup.carrierCd, // SKT : SK ,KT : KT,LG U+ : LG
        mvno_cd: popup.mvnoCd,
        usim_plan_nm: popup.searchText,
      },
    })

    if (response.ok) {
      const decodedResponse = await response.json()
      if (decodedResponse.data && decodedResponse.data.info) {
        let list = decodedResponse.data.info
        dataList.value = list
      }
    } else {
      throw new Error('Fetch data error')
    }
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

//this handles keyboard actions
function keydownHandle(event) {
  if (event.key === 'Escape') {
    popup.close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
})

onUnmounted(() => {
  popup.close()
  document.removeEventListener('keydown', keydownHandle)
})

// watchs for changes in popup.active and fetchs data
watchEffect(() => {
  if (popup.active) fetchData()
})
</script>

<style scoped>
.overlay {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  z-index: 1100;
  background-color: rgba(0, 0, 0, 0.552);
  padding: 20px;
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
  height: 60px;
  padding: 0 20px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Bottom shadow */
  z-index: 1101;
}

.innerHeader .material-symbols-outlined {
  font-size: 30px;
}

.scroll-content {
  padding: 0 20px;
}

.inputRow {
  position: relative;
  width: 30%;
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
  display: flex; /* Display the carrier buttons in a row */
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
  .card {
    display: none;
  }
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

  .card {
    width: 100%;
    margin-bottom: 25px;
    padding: 10px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .card:hover {
    opacity: 1;
    cursor: default;
  }

  .card .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
  }

  .card .title .icon {
    font-size: 20px;
    color: #797979;
  }

  .card .body {
    display: flex;
    flex-direction: column;
    color: #707070;
    gap: 10px;
  }

  .card .body div {
    display: flex;
    align-items: center;
  }

  .card .body .material-symbols-outlined {
    font-variation-settings:
      'FILL' 1,
      'wght' 700,
      'opsz' 40;

    font-size: 22px;
    padding-right: 10px;
    padding-left: 5px;
    color: #afafaf;
  }

  .card .price {
    align-self: flex-end;
  }
  .card .price .original {
    color: #afafaf;
    text-decoration: line-through;
  }
  .card .price .sale {
    padding-left: 15px;
    padding-right: 10px;
    font-weight: bold;
    color: var(--main-color);
  }
}
</style>
