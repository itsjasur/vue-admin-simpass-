<template>
  <div class="htmls_container">
    <!-- add new button -->
    <button @click="openPopup(null)" class="add_new_button">신규등록 +</button>

    <!-- filters -->
    <div class="top_filters">
      <div class="top_filter_buttons">
        <button
          v-for="(item, index) in policyData?.carrier_type"
          :key="index"
          @click="selectType(item.cd)"
          :style="{ backgroundColor: selectedType === item.cd ? 'var(--main-color)' : null }"
        >
          {{ item.value }}
        </button>
      </div>

      <div class="filter_group">
        <label>대리점</label>
        <a-select
          v-model:value="selectedAgent"
          :style="{ width: '100%' }"
          @change="fetchHtmlsList"
          :options="[
            { value: '', label: '전체' },
            ...(agentCdList?.map((i) => ({ value: i.agent_cd, label: i.agent_nm })) || [])
          ]"
        >
        </a-select>
      </div>

      <div class="filter_group">
        <label>정책년월</label>
        <a-date-picker v-model:value="selectedMonth" @change="fetchHtmlsList" picker="month"></a-date-picker>
      </div>
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
          :data-source="htmlContents"
          bordered
          :pagination="false"
          size="middle"
          :showSorterTooltip="false"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'title'">
              <span class="clickable_title" @click="openPopup(record)">{{ text }}</span>
            </template>

            <template v-if="column.dataIndex === 'selectedMvnos'">
              <div class="selected_mvnos">
                <div
                  v-for="(mvno_cd, index) in text"
                  :key="index"
                  :style="{ backgroundColor: getRandomColor(mvno_cd) }"
                  class="selected_mvno_box"
                >
                  {{ policyData.mvno_cd_list?.find((i) => i.mvno_cd === mvno_cd)?.mvno_nm }}
                </div>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <div class="html_cards">
        <div v-for="(html, index) in htmlContents" :key="index" @click="openPopup(html)" class="html_card">
          <div class="html_card_row">
            <span>정책년월:</span>
            <span style=""> {{ html.policyDateMonth }}</span>
          </div>
          <div class="html_card_row">
            <span>제목:</span>
            <span style=""> {{ html.title }}</span>
          </div>
          <div class="html_card_row">
            <span>변경통신사:</span>
            <div class="selected_mvnos">
              <div
                v-for="(mvno_cd, index) in html.selectedMvnos"
                :key="index"
                :style="{ backgroundColor: getRandomColor(mvno_cd) }"
                class="selected_mvno_box"
              >
                {{ policyData.mvno_cd_list?.find((i) => i.mvno_cd === mvno_cd)?.mvno_nm }}
              </div>
            </div>
          </div>

          <div class="html_card_row">
            <span>날짜:</span>
            <span style=""> {{ html.createdAt }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <GlobalPopupWithOverlay ref="openOrUpdateHtml">
    <HtmlMakerView v-if="userIsCreator" :id="selectedId" @closePopup="closePopup" />
    <HtmlVIewerPopup v-else :id="selectedId" @closePopup="closePopup" />
  </GlobalPopupWithOverlay>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { ref, onMounted } from 'vue'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import HtmlVIewerPopup from '@/components/HtmlVIewerPopup.vue'
import HtmlMakerView from './HtmlMakerView.vue'

function getRandomColor(code) {
  const colors = [
    '#D66060', // Darker soft red
    '#D67F60', // Darker soft coral/orange
    '#D69F60', // Darker soft peach
    '#5F904A', // Darker soft green
    '#5F8FBA', // Darker soft blue
    '#765F9A', // Darker soft purple
    '#B063A9', // Darker soft magenta
    '#C3873C', // Darker soft amber
    '#599497', // Darker soft teal
    '#976487' // Darker soft rose
  ]
  const mappedColors = {
    HVS: colors[0],
    ISM: colors[1],
    KTM: colors[2],
    KTS: colors[3],
    SVM: colors[4],
    UPM: colors[5]
  }

  if (mappedColors?.[code]) return mappedColors[code]
  return colors[Math.floor(Math.random() * colors.length)]
}

const openOrUpdateHtml = ref(false)
const selectedId = ref(null)
const userIsCreator = ref(false)

function openPopup(selectedHtml) {
  if (selectedHtml?.id) {
    selectedId.value = selectedHtml?.id
    if (selectedHtml?.creator === username.value) userIsCreator.value = true
    else userIsCreator.value = false
  } else {
    selectedId.value = null
    userIsCreator.value = true
  }
  openOrUpdateHtml.value.showPopup()
}

function closePopup(result, needsRefresh) {
  openOrUpdateHtml.value.closePopup()
  if (needsRefresh) currentPage.value = 1
  if (result) fetchHtmlsList()
}

// list of string htmls
const htmlContents = ref([])

const totalCount = ref(0)
const currentPage = ref(1)
const rowLimit = ref(10)

//pagination change
function onPagChange(curPage, perPage) {
  currentPage.value = curPage
  rowLimit.value = perPage
  fetchHtmlsList()
}

const columns = ref([
  {
    title: 'No.',
    dataIndex: 'num',
    key: 'num',
    sorter: (a, b) => (a.num ?? 0) - (b.num ?? 0),
    sortDirections: ['descend', 'ascend'],
    width: 50
  },
  {
    title: '제목',
    dataIndex: 'title',
    key: 'title',
    sorter: (a, b) => (a.title ?? '').localeCompare(b.title ?? '')
  },

  {
    title: '정책년월',
    dataIndex: 'policyDateMonth',
    key: 'policyDateMonth',
    sorter: (a, b) => (a.policyDateMonth ?? '').localeCompare(b.policyDateMonth ?? ''),
    width: 100
  },
  {
    title: '변경통신사',
    dataIndex: 'selectedMvnos',
    key: 'selectedMvnos',
    sorter: (a, b) => (a.selectedMvnos ?? '').localeCompare(b.selectedMvnos ?? '')
  },
  {
    title: '날짜',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: (a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
    width: 150
  }
])

const policyData = ref()
const selectedType = ref('')
const selectedAgent = ref('')
const selectedMvno = ref('')
const selectedMonth = ref()
const agentCdList = ref()

// function selectType(type) {
//   selectedType.value = selectedType.value === type ? '' : type
//   selectedAgent.value = ''
//   fetchHtmlsList()
// }
async function selectType(type) {
  selectedType.value = selectedType.value === type ? '' : type
  selectedAgent.value = ''
  await fetchHtmlsList()
  agentCdList.value = policyData.value?.agent_cd_list
  // agentcdlist is regenereted after checking policydata
  if (selectedType.value) {
    agentCdList.value = policyData.value?.agent_cd_list?.filter((item) =>
      item?.carrier_type_list?.includes(selectedType.value)
    )
  }
}

const username = ref()
async function fetchUserInfo() {
  try {
    const response = await fetchWithTokenRefresh('admin/myInfo', { method: 'GET' })
    if (!response.ok) throw 'Fetch profile data error'
    const decodedResponse = await response.json()
    username.value = decodedResponse?.data?.info?.username
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

const fetchHtmlsList = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken')

    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-htmls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        carrier_type: selectedType.value,
        selected_agent: selectedAgent.value,
        selected_mvno: selectedMvno.value,
        policy_date_month: selectedMonth?.value?.format('YYYY-MM') ?? null,
        per_page: rowLimit.value,
        page_number: currentPage.value
      })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const decodedResponse = await response.json()
    htmlContents.value = decodedResponse.htmls
    totalCount.value = decodedResponse.total_count

    // agentCdList.value = policyData.value?.agent_cd_list
    // // agentcdlist is regenereted after checking policydata
    // if (selectedType.value) {
    //   agentCdList.value = policyData.value?.agent_cd_list?.filter((item) =>
    //     item?.carrier_type_list?.includes(selectedType.value)
    //   )
    // }
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  }
}

async function fetchPlicyinfo() {
  try {
    const response = await fetchWithTokenRefresh('agent/getPolicyInitInfo', { method: 'GET' })
    const decodedResponse = await response.json()
    // console.log(decodedResponse.data)
    if (!response.ok) throw 'Fetch plicy info error'
    policyData.value = decodedResponse?.data
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
  }
}

onMounted(async () => {
  // selectedMonth.value = dayjs()
  await fetchPlicyinfo()
  await fetchUserInfo()
  await fetchHtmlsList()
})
</script>

<style scoped>
.htmls_container {
  display: flex;
  flex-flow: column;
  margin: 20px;
  gap: 20px;
  /* align-items: flex-start; */
  /* justify-content: flex-start; */
}

.add_new_button {
  min-width: 120px;
  align-self: start;
}

.top_filters {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  align-items: flex-end;
}

.top_filter_buttons {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
}

.top_filter_buttons button {
  width: 100px;
  background-color: #b4b4b4;
}

.filter_group {
  max-width: 200px;
  flex: 1 0 calc(50% - 20px);
}

.pagination {
  margin-bottom: 10px;
}

.pagination :deep(button) {
  min-height: unset;
}

.table {
  max-width: 1200px;
  min-width: 800px;
  box-sizing: border-box;
}

.open_button {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: #fff;
  border: 1px solid var(--main-color);
  font-size: 15px;
  color: var(--main-color);
  width: 80px;
  height: 30px;
  min-height: unset;
}

.open_button .view_icon {
  font-size: 20px;
}

.selected_mvnos {
  display: flex;
  flex-flow: wrap;
  gap: 10px;
}
.selected_mvno_box {
  padding: 3px 10px;
  border-radius: 500px;
  color: #fff;
  min-width: 50px;
  text-align: center;
}

.clickable_title:hover {
  color: var(--main-color);
  cursor: pointer;
}

.html_cards {
  display: none;
  flex-flow: column;
  gap: 20px;
}

.html_card {
  background-color: #fff;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  flex-flow: column;
  gap: 10px;
}

.html_card_row {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  text-align: end;
}
.html_card_row > :nth-child(1) {
  word-break: keep-all;
}

.html_card:active,
.html_card:hover {
  background-color: #dfdfdf;
  cursor: pointer;
}

@media (max-width: 600px) {
  .html_cards {
    display: flex;
  }

  .table-wrap {
    display: none;
  }
}
</style>
