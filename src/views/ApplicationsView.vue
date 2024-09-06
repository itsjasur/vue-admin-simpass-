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

      <div class="group" style="min-width: 150px">
        <label>검색 선택</label>
        <a-select v-model:value="searchType" :style="{ width: '100%' }" :options="types">
        </a-select>
      </div>

      <!-- :change="(currentPage = 1)" -->
      <template v-if="searchType === 'status'">
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
      </template>

      <template v-else>
        <div class="group" style="min-width: 180px">
          <label>개통일자 (From)</label>
          <CleaveInput v-model="fromDate" :options="cleavePatterns.datePattern" />
        </div>

        <div class="group" style="min-width: 180px">
          <label>개통일자 (To)</label>
          <CleaveInput v-model="toDate" :options="cleavePatterns.datePattern" />
        </div>
      </template>
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
            <span v-if="column.dataIndex === 'chatting'">
              <div @click="openChat(record)" class="chat_buttton">
                <span class="material-symbols-outlined chat-icon"> chat </span>
              </div>
            </span>

            <template v-if="column.dataIndex === 'usim_act_status_nm'">
              <!-- status can't be changed if act_status is Y -->
              <span
                v-if="
                  userAuth.containsRole([
                    'ROLE_SUPER',
                    'ROLE_ADMIN',
                    'ROLE_OPEN_ADMIN',
                    'ROLE_OPEN_AGENCY',
                    'ROLE_OPEN_MANAGER'
                  ]) &&
                  record.usim_act_status !== 'Y' &&
                  record.usim_act_status !== 'Z'
                "
                @click="openStatusUpdatePopup(record)"
                :class="['status-' + record.usim_act_status, 'bordered-status-button']"
              >
                {{ text }}
                <span class="material-symbols-outlined edit-icon"> edit </span>
              </span>

              <span v-else :class="['status-' + record.usim_act_status, 'bordered-status-button']">
                {{ text }}
              </span>
            </template>

            <span v-if="column.dataIndex === 'apply_date' || column.dataIndex === 'act_date'">
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
          <span class="left-label">판매점명: </span>
          <span class="right-content">{{ item.partner_nm }}</span>
        </div>
        <div class="card-row">
          <span class="left-label">상태: </span>

          <!-- status can't be changed if act_status is Y -->
          <span
            v-if="item.usim_act_status !== 'Y' && item.usim_act_status !== 'Z'"
            @click="openStatusUpdatePopup(item)"
            :class="['status-' + item.usim_act_status, 'bordered-status-button']"
          >
            <span>{{ item.usim_act_status_nm }}</span>
            <span class="material-symbols-outlined edit-icon"> edit </span>
          </span>

          <span v-else :class="['status-' + item.usim_act_status, 'bordered-status-button']">
            <span>{{ item.usim_act_status_nm }}</span>
          </span>
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

  <ApplicationStatusUpdatePopup
    v-if="updateApplicationStatusPopup"
    :actNo="actNo"
    :statuses="propsStatuses"
    :currentStatus="currentApplicationStatus"
    :isNewNumber="isNewNumber"
    @closePopup="closeStatusUpdatePopup"
  />

  <GlobalPopupWithOverlay ref="applicationDetailsPopupRef">
    <ApplicationDetailsPopup :actNo="actNo" @closePopup="closeDetailsPopup" />
  </GlobalPopupWithOverlay>

  <GlobalPopupWithOverlay ref="imageViewerRef">
    <ImageViewPopup @closePopup="closeImageViewPopup" :imageUrls="imageBlobUrls" :canPrint="true" />
  </GlobalPopupWithOverlay>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { base64ToBlobUrl, formatDate } from '../utils/helpers'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import ApplicationStatusUpdatePopup from '../components/ApplicationStatusUpdatePopup.vue'
import ApplicationDetailsPopup from '../components/ApplicationDetailsPopup.vue'
import { usePageLoadingStore } from '@/stores/page-loading-store'
import { useMvnoSelectStore } from '@/stores/mvno_select_store'
import { useAuthenticationStore } from '@/stores/authentication'
import { useWebSocketStore } from '@/stores/webscoket-store'
import { useRouter } from 'vue-router'
import ImageViewPopup from '../components/ImageViewPopup.vue'

const router = useRouter()

const webSocketStore = useWebSocketStore()
const userAuth = useAuthenticationStore()

const imageViewerRef = ref()
const imageBlobUrls = ref([])
function openImageViewPopup(base64Images) {
  if (base64Images.length > 0) {
    imageBlobUrls.value = base64Images?.map((i) => base64ToBlobUrl(i)) || []
    imageViewerRef.value.showPopup()
  } else {
    useSnackbarStore().show('이미지가 없습니다!')
  }
}

function closeImageViewPopup() {
  imageViewerRef.value.closePopup()
}

// Reactive variables
const searchType = ref('status')
const types = ref([
  { value: 'status', label: '상태' },
  { value: 'apply-date', label: '접수일자' },
  { value: 'regis-date', label: '개통일자' }
])

//mvnos
const mvnos = ref([])

//status
const selectedStatus = ref('')
const statuses = ref([])

const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

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

//updating current page value if any of the below changes
watch(selectedStatus, (newValue, oldValue) => {
  if (newValue !== oldValue) currentPage.value = 1
})
watch(searchType, (newValue, oldValue) => {
  if (newValue !== oldValue) currentPage.value = 1
})
watch(
  () => useMvnoSelectStore().selected,
  (newValue, oldValue) => {
    if (newValue !== oldValue) currentPage.value = 1
  }
)

// updateApplicationStatusPopup popup and popup props
const updateApplicationStatusPopup = ref(false)

const propsStatuses = ref([])
const currentApplicationStatus = ref(null)
const isNewNumber = ref(true)
const actNo = ref(null)

function openStatusUpdatePopup(item) {
  isNewNumber.value = item?.usim_act_cd === 'N'
  currentApplicationStatus.value = item?.usim_act_status
  actNo.value = item?.act_no ?? null
  updateApplicationStatusPopup.value = true
}

function closeStatusUpdatePopup(result) {
  if (result) fetchData()
  updateApplicationStatusPopup.value = false
}

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
    title: '판매점명',
    dataIndex: 'partner_nm',
    key: 'partner_nm',
    sorter: (a, b) => (a.partner_nm ?? '').localeCompare(b.partner_nm ?? '')
  },
  {
    title: '채팅',
    dataIndex: 'chatting',
    key: 'chatting',
    width: 1
  },
  {
    title: '상태',
    dataIndex: 'usim_act_status_nm',
    key: 'usim_act_status_nm',
    sorter: (a, b) => (a.usim_act_status_nm ?? '').localeCompare(b.usim_act_status_nm ?? ''),
    width: 1
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
    title: '접수일자',
    dataIndex: 'apply_date',
    key: 'apply_date',
    sorter: (a, b) => (a.apply_date ?? '').localeCompare(b.apply_date ?? '')
  },
  {
    title: '개통일자',
    dataIndex: 'act_date',
    key: 'act_date',
    sorter: (a, b) => (a.act_date ?? '').localeCompare(b.act_date ?? '')
  }
])

// opens chat with this user
function openChat(record) {
  // console.log(record)
  if (record?.partner_cd) {
    webSocketStore.selectedRoom = null

    console.log('null room', webSocketStore.selectedRoom)
    webSocketStore.getRoomInfo(record.partner_cd, record.partner_nm)

    console.log('room added')
  }
}

//this listens if room is selected and then pushes afterwards
watch(
  () => webSocketStore.selectedRoom,
  (newv, oldv) => {
    if (newv) router.push('chats')
  }
)

const dataList = ref([])

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/actStatus', {
      method: 'POST',
      body: {
        act_no: '',
        mvno_cd: useMvnoSelectStore().selected,
        partner_cd: '',
        usim_act_status: searchType.value === 'status' ? selectedStatus.value : '',
        apply_fr_date: searchType.value === 'apply-date' ? fromDate.value : '', //접수일자 from
        apply_to_date: searchType.value === 'apply-date' ? toDate.value : '', //접수일자 to
        act_fr_date: searchType.value === 'regis-date' ? fromDate.value : '', //개통완료일자 from
        act_to_date: searchType.value === 'regis-date' ? toDate.value : '', //개통완료일자 to
        page: currentPage.value,
        rowLimit: rowLimit.value
      }
    })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    dataList.value = decodedResponse.data.act_list

    mvnos.value = [{ mvno_cd: '', mvno_nm: '전체' }]
    decodedResponse.data.mvno_info_list.forEach((item) => mvnos.value.push(item))

    statuses.value = [{ cd: '', value: '전체' }]
    decodedResponse.data.usim_act_status_code.forEach((item) => statuses.value.push(item))
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
    openImageViewPopup(decodedResponse?.data?.apply_forms_list ?? [])
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
  min-width: 1300px;
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

.chat_buttton {
  min-width: 50px;
  background-color: var(--main-color);
  border-radius: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.chat_buttton:hover {
  cursor: pointer;
  filter: brightness(0.6);
}

.status-A {
  background-color: #3f76e3;
}
.status-P {
  background-color: #e3a13f;
}
.status-D {
  background-color: #e33f3f;
}

.status-Y {
  background-color: #505050;
}

.status-W {
  background-color: #e33f4a;
}
.status-C {
  background-color: #ff4646;
}
.status-Z {
  background-color: #695639;
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
