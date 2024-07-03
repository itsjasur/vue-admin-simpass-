<template>
  <div class="container">
    <!-- button -->
    <button @click="openPopup(null)" class="add-new-button">신규등록 +</button>

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
              <span :class="['status-' + text, 'bordered-status-button']">
                {{ record.status_nm }}
              </span>
            </template>

            <template v-if="column.dataIndex === 'action'">
              <span @click="openPopup(record.username)" class="material-symbols-outlined edit-icon">
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
          <span :class="['status-' + item.status, 'bordered-status-button']">{{
            item.status_nm
          }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">아이디: </span>
          <span class="right-content">{{ item.username }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">휴대폰: </span>
          <span class="right-content">{{ item.phone_number }}</span>
        </div>
        <div class="card-row">
          <span class="left-label">이매일: </span>
          <span class="right-content">{{ item.email }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">국가: </span>
          <span class="right-content">{{ item.country_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">시작일자: </span>
          <span class="right-content">{{ item.from_date }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">액션: </span>
          <span @click="openPopup(item.username)" class="right-content"
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
    v-if="addUpdatePopup"
    :isNew="selectedUsername === null"
    :username="selectedUsername"
    @closePopup="closePopup"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { formatDate } from '../utils/helpers'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import AddNewUserPopup from '../components/UpdateAddNewUserPopup.vue'

const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

//add or update user
const addUpdatePopup = ref(false)
const selectedUsername = ref(null)
const userId = ref(null)

function openPopup(userName) {
  addUpdatePopup.value = true
  selectedUsername.value = userName ?? null
}

function closePopup(result, needsRefresh) {
  addUpdatePopup.value = false
  if (needsRefresh) currentPage.value = 1
  if (result) fetchData()
}

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

const columns = ref([
  {
    title: 'No.',
    dataIndex: 'id',
    key: 'id',
    sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
    sortDirections: ['descend', 'ascend']
  },
  {
    title: '아이디',
    dataIndex: 'username',
    key: 'username',
    sorter: (a, b) => (a.username ?? '').localeCompare(b.username ?? '')
  },
  {
    title: '이름',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? '')
  },
  {
    title: '국가',
    dataIndex: 'country_nm',
    key: 'country_nm',
    sorter: (a, b) => (a.country_nm ?? '').localeCompare(b.country_nm ?? '')
  },

  {
    title: '휴대전화',
    dataIndex: 'phone_number',
    key: 'phone_number',
    sorter: (a, b) => (a.phone_number ?? '').localeCompare(b.phone_number ?? '')
  },

  {
    title: '이매일',
    dataIndex: 'email',
    key: 'email',
    sorter: (a, b) => (a.email ?? '').localeCompare(b.email ?? '')
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => (a.status ?? '').localeCompare(b.status ?? '')
  },

  {
    title: '시작일자',
    dataIndex: 'from_date',
    key: 'from_date',
    sorter: (a, b) => (a.from_date ?? '').localeCompare(b.from_date ?? '')
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
    const response = await fetchWithTokenRefresh('admin/member', {
      method: 'POST',
      body: { page: currentPage.value, rowLimit: rowLimit.value }
    })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    dataList.value = decodedResponse.data.rows
    totalCount.value = decodedResponse.data.totalNum
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

onMounted(fetchData)
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1400px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.add-new-button {
  width: auto;
  min-width: 150px;
  align-self: flex-start;
  margin: 0 20px;
  margin-top: 30px;
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

.status-Y {
  background-color: var(--main-color);
}

.status-W {
  background-color: #ed863d;
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
    align-items: center;
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
