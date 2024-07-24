<template>
  <div class="container">
    <!-- button -->
    <div class="search-part">
      <div class="group" style="width: 250px">
        <label>판매점명</label>
        <input v-model="searchText" />
      </div>

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

      <button @click="fetchData" style="min-width: 100px; width: auto">조희</button>
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
              <span
                v-if="text === 'W'"
                @click="openStatusUpdatePopup(record)"
                :class="['status-' + text, 'bordered-status-button']"
              >
                {{ record.status_nm }}
                <span class="material-symbols-outlined edit-icon"> edit </span>
              </span>

              <span v-else :class="['status-' + text, 'bordered-status-button']">
                {{ record.status_nm }}
              </span>
            </template>

            <template v-if="column.dataIndex === 'details'">
              <button @click="selectPartner(record.partner_cd)" class="reg-details-button">
                가입정보
              </button>
            </template>

            <template v-if="column.dataIndex === 'contractor'">
              <div style="max-width: 300px">
                {{ text }}
              </div>
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
          <span class="left-label">판매점명: </span>
          <span class="right-content">{{ item.partner_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">상태: </span>

          <span
            v-if="item.status === 'W'"
            @click="openStatusUpdatePopup(item)"
            :class="['status-' + item.status, 'bordered-status-button']"
            class="right-content"
          >
            {{ item.status_nm }}
            <span class="material-symbols-outlined edit-icon"> edit </span>
          </span>

          <span v-else :class="['status-' + item.status, 'bordered-status-button']">
            {{ item.status_nm }}
          </span>
        </div>
        <div class="card-row">
          <span class="left-label">대리점명: </span>
          <span class="right-content">{{ item.partner_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">대표자명: </span>
          <span class="right-content">{{ item.contractor }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">연락처: </span>
          <span class="right-content">{{ item.phone_number }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">사업자번호: </span>
          <span class="right-content">{{ item.business_num }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">상세정보: </span>
          <button @click="selectPartner(item.partner_cd)" class="right-content reg-details-button">
            가입정보
          </button>
        </div>
      </div>
    </div>

    <div></div>
    <div></div>
    <div></div>

    <PartnerDetails
      v-if="partnerDetailsPopup"
      @closePopup="partnerDetailsPopup = false"
      :partnerCd="selectedPartnerCd"
    />

    <PartnerStatusUpdatePopup
      v-if="statusUpdatePOpup"
      :partnerCd="selectedPartnerCd"
      :agentCd="selectedAgentCd"
      :currentStatus="currentStatus"
      :statuses="propStatuses"
      @closePopup="closeStatusUpdatePopup"
      popupFor="partner-requests"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'

import PartnerDetails from '../components/PartnerDetailsPopup.vue'
import { useImagesHolderStore } from '@/stores/image-holder-store'
import PartnerStatusUpdatePopup from '../components/PartnerStatusUpdatePopup.vue'

const partnerDetailsPopup = ref(false)
const selectedPartnerCd = ref()
const selectedAgentCd = ref()

const selectedStatus = ref('')
const statuses = ref([])
const propStatuses = ref([])
const searchText = ref()

const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

//pagination change
function onPagChange(curPage, perPage) {
  // console.log(curPage, perPage)
  currentPage.value = curPage
  rowLimit.value = perPage
  fetchData()
}

function selectPartner(partnerCd) {
  selectedPartnerCd.value = partnerCd
  partnerDetailsPopup.value = true
}

//status update popup

const currentStatus = ref(null)
const statusUpdatePOpup = ref(false)
function openStatusUpdatePopup(item) {
  currentStatus.value = item.status
  selectedPartnerCd.value = item.partner_cd
  selectedAgentCd.value = item.agent_cd
  statusUpdatePOpup.value = true
}
function closeStatusUpdatePopup(result) {
  statusUpdatePOpup.value = false
  if (result) fetchData()
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
    sorter: (a, b) => (a.status ?? '').localeCompare(b.status ?? ''),
    width: 1
  },

  {
    title: '판매점명',
    dataIndex: 'partner_nm',
    key: 'partner_nm',
    sorter: (a, b) => (a.partner_nm ?? '').localeCompare(b.partner_nm ?? '')
  },

  {
    title: '대표자명',
    dataIndex: 'contractor',
    key: 'contractor',
    sorter: (a, b) => (a.contractor ?? '').localeCompare(b.contractor ?? '')
    // ,width: 350
  },

  {
    title: '연락처',
    dataIndex: 'phone_number',
    key: 'phone_number',
    sorter: (a, b) => (a.phone_number ?? '').localeCompare(b.phone_number ?? '')
  },
  {
    title: '사업자번호',
    dataIndex: 'business_num',
    key: 'business_num',
    sorter: (a, b) => (a.business_num ?? '').localeCompare(b.business_num ?? '')
  },

  {
    title: '접수일자',
    dataIndex: 'apply_date',
    key: 'apply_date',
    sorter: (a, b) => (a.apply_date ?? '').localeCompare(b.apply_date ?? '')
  },

  {
    title: '상세정보',
    dataIndex: 'details',
    key: 'details',
    align: 'center'
  }
])

const dataList = ref([])

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/partner', {
      method: 'POST',
      body: {
        partner_nm: searchText.value,
        status: selectedStatus.value,
        page: currentPage.value,
        rowLimit: rowLimit.value
      }
    })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    dataList.value = decodedResponse.data.partner_list

    statuses.value = [{ cd: '', value: '전체' }]

    decodedResponse.data.status_list.forEach((item) => statuses.value.push(item))
    propStatuses.value = decodedResponse.data.status_list
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

.reg-details-button {
  background-color: transparent;
  border: 1px dashed var(--main-color);
  color: var(--main-color);
  padding: 0 5px;
  max-height: 30px;
  min-height: unset;
  width: auto;
}

.status-Y {
  background-color: var(--main-color);
}

.status-W {
  background-color: #f4722c;
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
    align-items: center;
    justify-content: space-between;
  }

  .right-content {
    display: flex;
    align-items: center;
  }

  .reg-form-attach {
    padding: 0;
  }
}
</style>
