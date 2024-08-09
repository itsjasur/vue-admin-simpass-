<template>
  <div class="container">
    <!-- button -->
    <div class="search-part">
      <div class="group" style="min-width: 200px">
        <label>통신사</label>
        <a-select
          v-model:value="useMvnoSelectStore().selected"
          :style="{ width: '100%' }"
          :options="
            mvnos.map((i) => ({ value: i.mvno_cd, label: i.mvno_nm })) ?? [
              { value: 'N/A', label: 'N/A' }
            ]
          "
        >
        </a-select>
      </div>

      <div class="group" style="min-width: 180px">
        <label>출력일자 (From)</label>
        <input v-model="fromDate" v-cleave="cleavePatterns.datePattern" />
      </div>

      <div class="group" style="min-width: 180px">
        <label>출력일자 (To)</label>
        <input v-model="toDate" v-cleave="cleavePatterns.datePattern" />
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
        @change="onPaginationChange"
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
            <span v-if="column.dataIndex === 'mvno_cd'">
              {{ record.mvno_cd_nm }}
            </span>

            <span v-if="column.dataIndex === 'apply_date'">
              {{ text?.split(' ')[0] }}
            </span>

            <template v-if="column.dataIndex === 'regDetails'">
              <button @click="openDetailsPopup(record)" class="reg-details-button">가입정보</button>
            </template>

            <span
              v-if="column.dataIndex === 'regForm'"
              @click="fetchForms(record.act_no)"
              class="material-symbols-outlined reg-form-attach"
            >
              attach_file
            </span>
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
        @change="onPaginationChange"
      >
        <template #buildOptionText="props">
          <span>{{ props.value }} / 페이지</span>
        </template>
      </a-pagination>

      <div class="card" v-for="(item, index) in dataList" :key="index">
        <div class="card-row">
          <span class="left-label">직원명: </span>
          <span class="right-content">{{ item.member_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">통신사: </span>
          <span class="right-content">{{ item.mvno_cd_nm }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">고객명: </span>
          <span class="right-content">{{ item.name }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">가입번호: </span>
          <span class="right-content">{{ item.phone_number }}</span>
        </div>

        <div class="card-row">
          <span class="left-label">가입정보: </span>
          <span class="right-content">
            <button @click="openDetailsPopup(item)" class="reg-details-button">가입정보</button>
          </span>
        </div>

        <div class="card-row">
          <span class="left-label">가입신청서: </span>
          <span class="right-content">
            <span
              @click="fetchForms(item.act_no)"
              class="material-symbols-outlined reg-form-attach"
            >
              attach_file
            </span>
          </span>
        </div>
      </div>
    </div>

    <div></div>
    <div></div>
    <div></div>
  </div>

  <!-- <ApplicationDetailsPopup
    v-if="applicationDetailsPopup"
    :actNo="actNo"
    @closePopup="applicationDetailsPopup = false"
  /> -->

  <GlobalPopupWithOverlay ref="applicationDetailsPopupRef">
    <ApplicationDetailsPopup :actNo="actNo" @closePopup="closeDetailsPopup" />
  </GlobalPopupWithOverlay>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { formatDate } from '../utils/helpers'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import ApplicationDetailsPopup from '../components/ApplicationDetailsPopup.vue'
import { usePageLoadingStore } from '@/stores/page-loading-store'
import { usePrintableStore } from '../stores/printable-store'
import { useMvnoSelectStore } from '@/stores/mvno_select_store'
import GlobalPopupWithOverlay from '../components/GlobalPopupWithOverlay.vue'

// Reactive variables
// const types = ref([{ value: 'apply-date', label: '출력일자' }])

//mvnos
const mvnos = ref([])

const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

watch(
  () => useMvnoSelectStore().selected,
  (newValue, oldValue) => {
    if (newValue !== oldValue) currentPage.value = 1
  }
)

//applicationDetailspoup
const applicationDetailsPopupRef = ref()
function openDetailsPopup(item) {
  actNo.value = item?.act_no ?? null
  applicationDetailsPopupRef.value.showPopup()
}
function closeDetailsPopup() {
  actNo.value = null
  applicationDetailsPopupRef.value.closePopup()
}

const propsStatuses = ref([])
const currentApplicationStatus = ref(null)
const isNewNumber = ref(true)
const actNo = ref(null)

//from date set to 7 days ago default when initialized
const toDate = ref(formatDate(new Date()))
const fromDate = ref(formatDate(new Date(new Date().setDate(new Date().getDate() - 7))))

//pagination change
function onPaginationChange(curPage, perPage) {
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
    title: '직원명',
    dataIndex: 'member_nm',
    key: 'member_nm',
    sorter: (a, b) => (a.member_nm ?? '').localeCompare(b.member_nm ?? '')
  },

  {
    title: '통신사',
    dataIndex: 'mvno_cd',
    key: 'mvno_cd',
    sorter: (a, b) => (a.mvno_cd ?? '').localeCompare(b.mvno_cd ?? '')
  },

  {
    title: '고객명',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? '')
  },

  {
    title: '가입번호',
    dataIndex: 'phone_number',
    key: 'phone_number',
    sorter: (a, b) => (a.phone_number ?? '').localeCompare(b.phone_number ?? '')
  },
  {
    title: '가입정보',
    dataIndex: 'regDetails',
    key: 'status',
    align: 'center',
    width: 100
  },

  {
    title: '가입신청서',
    dataIndex: 'regForm',
    key: 'regForm',
    align: 'center'
  },
  {
    title: '출력일자',
    dataIndex: 'apply_date',
    key: 'apply_date',
    sorter: (a, b) => (a.apply_date ?? '').localeCompare(b.apply_date ?? '')
  }
])

const dataList = ref([])

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/applyPrint', {
      method: 'POST',
      body: {
        act_no: '',
        mvno_cd: useMvnoSelectStore().selected,
        partner_cd: '',
        usim_act_status: '',
        apply_fr_date: fromDate.value, //접수일자 from
        apply_to_date: toDate.value, //접수일자 to
        page: currentPage.value,
        rowLimit: rowLimit.value
      }
    })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    dataList.value = decodedResponse.data.act_list

    mvnos.value = [{ mvno_cd: '', mvno_nm: '전체' }]
    decodedResponse.data.mvno_info_list.forEach((item) => mvnos.value.push(item))

    propsStatuses.value = decodedResponse.data.usim_act_status_code

    totalCount.value = decodedResponse.data.totalNum
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

async function fetchForms(actNo) {
  usePageLoadingStore().start()

  try {
    const response = await fetchWithTokenRefresh('agent/actForms', {
      method: 'POST',
      body: { act_no: actNo }
    })
    if (!response.ok) throw 'Fetch forms data error'
    const decodedResponse = await response.json()
    usePrintableStore().open(decodedResponse?.data?.apply_forms_list ?? [])
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
    usePageLoadingStore().stop()
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
  min-width: 1000px;
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
  margin: 0px;

  max-height: 30px;
  min-height: unset;
}

.card-part {
  display: none;
}

/* pagination button padding */
.pagination :deep(button) {
  min-height: unset;
}

.reg-form-attach {
  color: #2173ff;
  user-select: none;
  cursor: pointer;
  padding: 0 20px;
}
.reg-form-attach:hover {
  color: #00389a;
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

  .reg-form-attach {
    padding: 0;
  }
}
</style>
