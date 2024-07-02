<template>
  <div class="container">
    <!-- filter and search part -->
    <div class="filter-part">
      <button
        @click="updateAddPlanPopup = true"
        class="add-new-button"
        style="width: auto; min-width: 150px"
      >
        신규등록 +
      </button>

      <button class="filter-button" @click="plansFilterPopup.open()">
        <span class="material-symbols-outlined button-icon"> filter_alt </span>
        <span>필터</span>
        <span v-if="plansFilterPopup.activeFiltersCount()" class="badge">{{
          plansFilterPopup.activeFiltersCount()
        }}</span>
      </button>

      <div class="group" style="min-width: 250px">
        <label>요금제명</label>
        <input v-model="plansFilterPopup.searchText" />
      </div>
    </div>

    <!-- table -->
    <div class="table-part">
      <a-pagination
        class="pagination"
        size="small"
        :total="plansFilterPopup.totalCount"
        :current="plansFilterPopup.currentPage"
        :pageSize="plansFilterPopup.rowLimit"
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
            <template v-if="column.dataIndex === 'status'">
              <span :class="['status-' + text, 'status-default']">
                {{ record.status_nm }}
              </span>
            </template>

            <template v-if="column.dataIndex === 'action'">
              <span @click="openEditOrPopup(record.id)" class="material-symbols-outlined edit-icon">
                edit
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="card-part">
      <a-pagination
        class="pagination"
        size="small"
        :total="plansFilterPopup.totalCount"
        :current="plansFilterPopup.currentPage"
        :pageSize="plansFilterPopup.rowLimit"
        show-size-changer
        @change="onPagChange"
      >
        <template #buildOptionText="props">
          <span>{{ props.value }} / 페이지</span>
        </template>
      </a-pagination>

      <div class="card" v-for="(item, index) in dataList" :key="index">
        <div class="card-row">
          <span class="left-label">상태: </span>
          <span class="right-content">{{ item.status_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">요금제명: </span>
          <span class="right-content">{{ item.usim_plan_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">통신사: </span>
          <span class="right-content">{{ item.carrier_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">브랜드: </span>
          <span class="right-content">{{ item.mvno_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">대리점: </span>
          <span class="right-content">{{ item.agent_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">서비스 유형: </span>
          <span class="right-content">{{ item.carrier_type_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">가입대상: </span>
          <span class="right-content">{{ item.carrier_plan_type_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">기본료: </span>
          <span class="right-content">{{ item.basic_fee }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">음성: </span>
          <span class="right-content">{{ item.voice }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">문자: </span>
          <span class="right-content">{{ item.message }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">데이터: </span>
          <span class="right-content">{{ item.cell_data }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">액션: </span>
          <span @click="openEditOrPopup(item.id)" class="right-content"
            ><span class="material-symbols-outlined edit-icon"> edit </span></span
          >
        </div>
      </div>
    </div>

    <div></div>
    <div></div>
    <div></div>
  </div>
  <AddNewUserPopup
    v-if="addNewPlanPopup"
    :isNew="selectedUsername === null"
    :username="selectedUsername"
    :id="id"
    @closePopup="addUpdatePopup = false"
  />
  <ManagePlansFilterPopup v-if="plansFilterPopup.active" />

  <UpdateAddNewPlanPopup v-if="updateAddPlanPopup" @closePopup="closePopup" :id="id" />
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { formatDate } from '../utils/helpers'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import AddNewUserPopup from '../components/UpdateAddNewUserPopup.vue'
import ManagePlansFilterPopup from '../components/ManagePlansFilterPopup.vue'
import { usePlansFilterPopup } from '../stores/manage-plans-popup-store'

import UpdateAddNewPlanPopup from '../components/UpdateAddNewPlanPopup.vue'

const plansFilterPopup = usePlansFilterPopup()

//update or add plan popup
const updateAddPlanPopup = ref(false)
function closePopup(result) {
  if (closePopup) fetchData()
  updateAddPlanPopup.value = false
}

//filter and search data
watch(
  () => [
    plansFilterPopup.carrier,
    plansFilterPopup.mvno,
    plansFilterPopup.agent,
    plansFilterPopup.carrierType,
    plansFilterPopup.carrierPlanType,
    plansFilterPopup.status,
    plansFilterPopup.searchText
  ],
  fetchData
)

watch(
  () => [plansFilterPopup.carrier],
  (n, o) => {
    fetchData()
  }
)

//add or update user
const addNewPlanPopup = ref(false)
const selectedUsername = ref(null)
const id = ref(null)

const addUpdatePopup = ref(false)
function openEditOrPopup(selId) {
  id.value = selId ?? null
  updateAddPlanPopup.value = true
}

//from date set to 7 days ago default when initialized
const toDate = ref(formatDate(new Date()))
const fromDate = ref(formatDate(new Date(new Date().setDate(new Date().getDate() - 7))))

//pagination change
function onPagChange(curPage, perPage) {
  plansFilterPopup.currentPage = curPage
  plansFilterPopup.rowLimit = perPage
  fetchData()
}

//table
const columns = ref([
  {
    title: 'No.',
    dataIndex: 'num',
    key: 'num',
    sorter: (a, b) => a.num ?? 0 - b.num ?? 0,
    sortDirections: ['descend', 'ascend']
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => (a.status ?? '').localeCompare(b.status ?? '')
  },
  {
    title: '요금제명',
    dataIndex: 'usim_plan_nm',
    key: 'usim_plan_nm',
    sorter: (a, b) => (a.usim_plan_nm ?? '').localeCompare(b.usim_plan_nm ?? '')
  },
  {
    title: '통신사',
    dataIndex: 'carrier_nm',
    key: 'carrier_nm',
    sorter: (a, b) => (a.carrier_nm ?? '').localeCompare(b.carrier_nm ?? '')
  },

  {
    title: '브랜드',
    dataIndex: 'mvno_nm',
    key: 'mvno_nm',
    sorter: (a, b) => (a.mvno_nm ?? '').localeCompare(b.mvno_nm ?? '')
  },

  {
    title: '대리점',
    dataIndex: 'agent_nm',
    key: 'agent_nm',
    sorter: (a, b) => (a.agent_nm ?? '').localeCompare(b.agent_nm ?? '')
  },
  {
    title: '서비스 유형',
    dataIndex: 'carrier_type_nm',
    key: 'carrier_type_nm',
    sorter: (a, b) => (a.carrier_type_nm ?? '').localeCompare(b.carrier_type_nm ?? '')
  },
  {
    title: '가입대상',
    dataIndex: 'carrier_plan_type_nm',
    key: 'carrier_plan_type_nm',

    sorter: (a, b) => (a.carrier_plan_type_nm ?? '').localeCompare(b.carrier_plan_type_nm ?? '')
  },

  {
    title: '기본료',
    dataIndex: 'basic_fee',
    key: 'basic_fee',
    sorter: (a, b) => (a.basic_fee ?? '').localeCompare(b.basic_fee ?? '')
  },

  {
    title: '판매금액',
    dataIndex: 'sales_fee',
    key: 'sales_fee',
    sorter: (a, b) => (a.sales_fee ?? '').localeCompare(b.sales_fee ?? '')
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
    title: '영상/기타',
    dataIndex: 'video_etc',
    key: 'video_etc',
    sorter: (a, b) => (a.video_etc ?? '').localeCompare(b.video_etc ?? '')
  },
  {
    title: 'QOS',
    dataIndex: 'qos',
    key: 'qos',
    sorter: (a, b) => (a.qos ?? '').localeCompare(b.qos ?? '')
  },
  {
    title: '우선순위',
    dataIndex: 'priority',
    key: 'priority',
    sorter: (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
  },
  {
    title: '액션',
    dataIndex: 'action',
    key: 'action',
    align: 'center'
  }
])

const dataList = ref([])

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/plan', {
      method: 'POST',
      body: {
        usim_plan_nm: plansFilterPopup.searchText, //요금제명
        carrier_cd: plansFilterPopup.carrier, //통신사
        mvno_cd: plansFilterPopup.mvno, //브랜드
        agent_cd: plansFilterPopup.agent, //대리점
        carrier_type: plansFilterPopup.carrierType, //서비스유형
        carrier_plan_type: plansFilterPopup.carrierPlanType, // 가입대상
        status: plansFilterPopup.status, //상태
        page: plansFilterPopup.currentPage,
        rowLimit: plansFilterPopup.rowLimit
      }
    })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    dataList.value = decodedResponse.data.plan_list
    plansFilterPopup.totalCount = decodedResponse.data.totalNum
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

onMounted(fetchData)

// onUnmounted(plansFilterPopup.clear)
</script>

<style scoped>
.container {
  width: 100%;
  /* max-width: 1700px; */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.filter-part {
  display: flex;
  flex-flow: wrap;
  align-items: flex-end;
  gap: 20px;
  margin-left: 20px;
  margin-top: 20px;
}

.filter-button {
  width: auto;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #828282;
  position: relative;
}

.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 5px 10px;
  border-radius: 50%;
  background-color: #ff1616;
  color: white;
  font-size: 12px;
}

.search-button {
  width: auto;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3554b4;
}

.filter-part .button-icon {
  font-size: 22px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.table {
  max-width: none;
  min-width: 1800px;
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

.status-default {
  background-color: #828282;
  padding: 5px 10px;
  color: #fff;
  font-size: 14px;
  width: 100%;
  border-radius: 20px;
  white-space: nowrap;
}

.status-Y {
  background-color: var(--main-color);
}

.status-N {
  background-color: #ff2e2e;
}

.reg-form-icon {
  color: var(--main-color);
  cursor: pointer;
  user-select: none; /* unselectable */
}

.card-part {
  display: none;
}

/* pagination button padding */
.pagination :deep(button) {
  min-height: unset;
}

.edit-icon {
  padding: 0 10px;
  color: var(--main-color);
  cursor: pointer;
  user-select: none;
}

@media (max-width: 600px) {
  .card-part {
    display: flex;
    flex-flow: column;
    gap: 15px;
  }

  .table-part {
    display: none;
  }

  .card {
    padding: 10px;
    border: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0 20px;
  }

  .card:hover {
    background-color: #fff;
    cursor: inherit;
  }

  .card-row {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
  }

  .right-content {
    display: flex;
    align-items: center;
  }
  .right-content .reg-form-icon {
    margin-right: 5px;
  }
}
</style>
