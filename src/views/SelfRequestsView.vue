<template>
  <div class="container">
    <!-- button -->
    <div class="search-part">
      <div class="group" style="min-width: 150px">
        <label>상태</label>
        <a-select
          v-model:value="selectedStatus"
          :style="{ width: '100%' }"
          :options="
            statuses.map((i) => ({ value: i.cd, label: i.value })) ?? [
              { value: 'N/A', label: 'N/A' }
            ]
          "
        >
        </a-select>
      </div>

      <div class="group" style="min-width: 150px">
        <label>국가</label>
        <a-select
          v-model:value="selecteCountry"
          :style="{ width: '100%' }"
          :options="
            countries.map((i) => ({ value: i.cd, label: i.value })) ?? [
              { value: 'N/A', label: 'N/A' }
            ]
          "
        >
        </a-select>
      </div>

      <div class="group" style="width: 250px">
        <label>이름</label>
        <input v-model="searchText" @input="fetchData" />
      </div>

      <button @click="fetchData" style="min-width: 100px; width: auto">검색</button>
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
                <span>{{ record.status_nm }}</span>
              </span>
            </template>

            <template v-if="column.dataIndex === 'country_cd'">
              <span>{{ record.country_nm }}</span>
            </template>

            <template v-if="column.dataIndex === 'name'">
              <span class="name-column">{{ text }}</span>
            </template>

            <template v-if="column.dataIndex === 'details'">
              <button class="details-button" @click="openDetailsPopup(record)">정보 보기</button>
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
          <span :class="['status-' + item.status, 'bordered-status-button']">
            <span>{{ item.status_nm }}</span>
          </span>
        </div>

        <div class="card-row">
          <span class="left-label">이름: </span>
          <span class="right-content">{{ item.name }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">연락처: </span>
          <span class="right-content">{{ item.contact }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">국가: </span>
          <span class="right-content">{{ item.country_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">요금제: </span>
          <span class="right-content">{{ item.plan_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">가입구분명: </span>
          <span class="right-content">{{ item.usim_act_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">세부: </span>
          <button @click="openDetailsPopup(item)" class="details-button">정보 보기</button>
        </div>
      </div>
    </div>

    <div></div>
  </div>

  <SelfRequestDetailsPopup
    v-if="detailsPopup"
    @closePopup="detailsPopup = false"
    :id="selectedId"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import SelfRequestDetailsPopup from '../components/SelfRequestDetailsPopup.vue'

const searchText = ref()
const selectedStatus = ref('')
const statuses = ref([])
const selecteCountry = ref('')
const countries = ref([])

const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

const detailsPopup = ref(false)
const selectedId = ref()

function openDetailsPopup(item) {
  selectedId.value = item?.id ?? null
  detailsPopup.value = true
}

//pagination change
function onPagChange(curPage, perPage) {
  currentPage.value = curPage
  rowLimit.value = perPage
  fetchData()
}

const columns = ref([
  {
    title: 'No.',
    dataIndex: 'num',
    key: 'num',
    sorter: (a, b) => (a.num ?? 0) - (b.num ?? 0),
    sortDirections: ['descend', 'ascend']
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => (a.status ?? '').localeCompare(b.status ?? '')
  },
  {
    title: '이름',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? '')
  },
  {
    title: '연락처',
    dataIndex: 'contact',
    key: 'contact',
    sorter: (a, b) => (a.contact ?? '').localeCompare(b.contact ?? '')
  },

  {
    title: '국가',
    dataIndex: 'country_cd',
    key: 'country_cd',
    sorter: (a, b) => (a.country_cd ?? '').localeCompare(b.country_cd ?? '')
  },

  {
    title: '요금제',
    dataIndex: 'plan_nm',
    key: 'plan_nm',
    sorter: (a, b) => (a.plan_nm ?? '').localeCompare(b.plan_nm ?? '')
  },
  {
    title: '가입구분명',
    dataIndex: 'usim_act_nm',
    key: 'usim_act_nm',
    sorter: (a, b) => (a.usim_act_nm ?? '').localeCompare(b.usim_act_nm ?? '')
  },

  {
    title: '요청 날짜',
    dataIndex: 'reg_time',
    key: 'reg_time',
    sorter: (a, b) => (a.reg_time ?? '').localeCompare(b.reg_time ?? '')
  },
  {
    title: '세부',
    dataIndex: 'details',
    key: 'details',
    align: 'center'
  }
])

const dataList = ref([])

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('admin/selfInquiry', {
      method: 'POST',
      body: {
        name: searchText.value,
        country_cd: selecteCountry.value,
        status: selectedStatus.value,
        page: currentPage.value,
        rowLimit: rowLimit.value
      }
    })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()

    dataList.value = decodedResponse.data.apply_list

    statuses.value = [{ cd: '', value: '잔체' }]
    decodedResponse.data.status_list.forEach((item) => statuses.value.push(item))

    countries.value = [{ cd: '', value: '잔체' }]
    decodedResponse.data.country_list.forEach((item) => countries.value.push(item))

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
  /* max-width: 1400px; */
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

.search-part {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  align-items: flex-end;
  margin-left: 20px;
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
  min-width: 1400px;
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

.details-button {
  background-color: transparent;
  border: 1px dashed var(--main-color);
  color: var(--main-color);
  width: auto;
  padding: 0 5px;
  margin: 0px;
  max-height: 30px;
  height: 30px;
  line-height: 1;
  min-height: unset;
}

.status-A {
  background-color: #3f76e3;
}
.status-B {
  background-color: #00bfa2;
}
.status-P {
  background-color: #b511fb;
}

.status-Y {
  background-color: #505050;
}

.status-D {
  background-color: #e33f4a;
}
.status-W {
  background-color: #ff4646;
}

.status-C {
  background-color: #ff4646;
}

.bordered-status-button .edit-icon {
  font-size: 20px;
}

.card-part {
  display: none;
}

/* pagination button padding */
.pagination :deep(button) {
  min-height: unset;
}

.table .name-column {
  display: block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
