<template>
  <div class="container">
    <div class="search-row">
      <div class="group" style="max-width: 180px">
        <label>검색 선택</label>
        <a-select v-model:value="searchType" :style="{ width: '100%' }" :options="types"> </a-select>
      </div>

      <template v-if="searchType === 'status'">
        <div class="group" style="max-width: 180px">
          <label>Status</label>
          <a-select
            v-model:value="selectedStatus"
            :style="{ width: '100%' }"
            :options="statuses.map((i) => ({ value: i.cd, label: i.value })) ?? [{ value: 'N/A', label: 'N/A' }]"
          >
          </a-select>
        </div>
      </template>

      <template v-else>
        <div class="group" style="max-width: 180px">
          <label>개통일자 (From)</label>
          <input v-model="fromDate" v-cleave="cleavePatterns.datePattern" />
        </div>

        <div class="group" style="max-width: 180px">
          <label>개통일자 (To)</label>
          <input v-model="toDate" v-cleave="cleavePatterns.datePattern" />
        </div>
      </template>
      <button @click="fetchDate()" style="min-width: 100px; width: auto">선택</button>
    </div>

    <!-- table -->
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
          <template v-if="column.dataIndex === 'usim_act_status'">
            <span :class="['status-' + text, 'status-default']">
              {{ record.usim_act_status_nm }}
            </span>
          </template>
          <template v-if="column.dataIndex === 'reg_form'">
            <span
              v-if="record.apply_forms === 'Y'"
              @click="fetchAndOpenFile(record?.act_no)"
              class="material-symbols-outlined reg-form-icon"
            >
              folder_open
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <div class="card-part">
      <a-pagination
        class="pagination"
        size="small"
        :total="totalCount"
        :current="currentPage"
        :pageSize="rowLimit"
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
          <span class="right-content">{{ item.usim_act_cd_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">휴대폰: </span>
          <span class="right-content">{{ item.phone_number }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">접수일자: </span>
          <span class="right-content">{{ item.apply_date }}</span>
        </div>

        <div v-if="item.apply_forms === 'Y'" class="card-row">
          <span class="left-label">가입신청서: </span>

          <span
            @click="fetchAndOpenFile(item?.act_no)"
            class="right-content"
            style="cursor: pointer; color: var(--main-color)"
          >
            <span class="material-symbols-outlined reg-form-icon"> folder_open </span>
            <span>열기 및 인쇄</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { formatDate } from '../utils/helpers'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import { usePrintablePopup } from '../stores/printable-popup'

const printPopup = usePrintablePopup()

// Reactive variables
const searchType = ref('status')
const types = ref([
  { value: 'status', label: '상태' },
  { value: 'apply-date', label: '접수일자' },
  { value: 'regis-date', label: '개통일자' },
])

const selectedStatus = ref('A')
const statuses = ref([])
const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

//from date set to 7 days ago default when initialized
const toDate = ref(formatDate(new Date()))
const fromDate = ref(formatDate(new Date(new Date().setDate(new Date().getDate() - 7))))

//pagination change
function onPagChange(curPage, perPage) {
  currentPage.value = curPage
  rowLimit.value = perPage
  fetchData()
}

//table
const dataList = ref([])
const columns = ref([
  {
    title: 'NO.',
    dataIndex: 'num',
    key: 'num',
    sorter: (a, b) => a.num ?? 0 - b.num ?? 0,
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: '상태',
    dataIndex: 'usim_act_status',
    key: 'usim_act_status',
    sorter: (a, b) => (a.usim_act_status ?? '').localeCompare(b.usim_act_status ?? ''),
  },
  {
    title: '고객명',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => (a.phone_number ?? '').localeCompare(b.phone_number ?? ''),
  },
  {
    title: '휴대폰',
    dataIndex: 'phone_number',
    key: 'phone_number',
    sorter: (a, b) => (a.phone_number ?? '').localeCompare(b.phone_number ?? ''),
  },

  {
    title: '접수일자',
    dataIndex: 'apply_date',
    key: 'apply_date',
    sorter: (a, b) => (a.apply_date ?? '').localeCompare(b.apply_date ?? ''),
  },
  {
    title: '개통일자',
    dataIndex: 'act_date',
    key: 'act_date',
    sorter: (a, b) => (a.act_date ?? '').localeCompare(b.act_date ?? ''),
  },
  {
    title: '가입신청서',
    dataIndex: 'reg_form',
    key: 'reg_form',
    align: 'center',
  },
])

const fetchData = async () => {
  try {
    const response = await fetchWithTokenRefresh('agent/actStatus', {
      method: 'POST',
      body: {
        usim_act_status: '',
        apply_fr_date: searchType.value === 'apply-date' ? fromDate.value : '',
        apply_to_date: searchType.value === 'apply-date' ? toDate.value : '',
        act_fr_date: searchType.value === 'regis-date' ? fromDate.value : '',
        act_to_date: searchType.value === 'regis-date' ? toDate.value : '',
        page: currentPage.value,
        rowLimit: rowLimit.value,
      },
    })
    if (response.ok) {
      const decodedResponse = await response.json()
      if (decodedResponse.data) {
        dataList.value = decodedResponse?.data?.act_list ?? [{}]
        statuses.value = decodedResponse?.data?.usim_act_status_code ?? [{}]
        totalCount.value = decodedResponse?.data?.totalNum ?? 0
      }
    } else {
      throw new Error('Fetch data error')
    }
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

const fetchAndOpenFile = async (actNo) => {
  //here fetches files
  try {
    const response = await fetchWithTokenRefresh('agent/actForms', {
      method: 'POST',
      body: { act_no: actNo },
    })
    if (response.ok) {
      const decodedResponse = await response.json()
      if (decodedResponse.data && decodedResponse.data.apply_forms_list) {
        printPopup.open(decodedResponse.data.apply_forms_list)
      } else {
        throw 'No form with this ID'
      }
    } else {
      throw new Error('Fetch data error')
    }
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }

  //here printable popup opens
}

onMounted(fetchData)
</script>

<style scoped>
.container {
  max-width: 1400px;

  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
}

.search-row {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  align-items: flex-end;
}

.search-row .group {
  width: 100%;
  box-sizing: border-box;
}

.table-part {
  margin-bottom: 200px;
  display: flex;
  flex-flow: column;
  gap: 10px;
  overflow-x: auto;
}

.table-part::-webkit-scrollbar {
  height: 12px;
}

.table-part::-webkit-scrollbar-track {
  background-color: #f8f8f8;
}

.table-part::-webkit-scrollbar-thumb {
  background-color: #e6e6e6;
  border-radius: 6px;
}

.table-part::-webkit-scrollbar-thumb:hover {
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

.status-A {
  background-color: #3569cf;
}
.status-B {
  background-color: #479f47;
}

.status-P {
  background-color: #9f44d7;
}

.status-D,
.status-C {
  background-color: #ff4747;
}

.status-W {
  background-color: #ed863d;
}

:deep(button) {
  min-height: unset; /* Remove the global min-height */
}

.reg-form-icon {
  color: var(--main-color);
  cursor: pointer;
  user-select: none; /* unselectable */
}

.card-part {
  display: none;
}

@media (max-width: 600px) {
  /* .search-row * {
    flex: 1 0 150px;
    box-sizing: border-box;
    max-width: none !important;
  } */

  .card-part {
    display: flex;
    flex-flow: column;
    gap: 20px;
  }

  .table-part {
    display: none;
  }

  .card {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card:hover {
    opacity: 1;
    cursor: default;
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
