<template>
  <div class="htmls_container">
    <button @click="openPopup(null)" class="add_new_button">신규등록 +</button>
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
              <span class="clickable_title" @click="openPopup(record.id)">{{ text }}</span>
            </template>
            <template v-if="column.dataIndex === 'num'">
              <span class="clickable_title" @click="openPopup(record.id)">{{ text }}</span>
            </template>
            <template v-if="column.dataIndex === 'selectedMvnos'">
              <div class="selected_mvnos">
                <div
                  v-for="(mvno_cd, index) in text"
                  :key="index"
                  :style="{ backgroundColor: getRandomColor() }"
                  class="selected_mvno_box"
                >
                  {{ mvnos?.find((i) => i.mvno_cd === mvno_cd)?.mvno_nm }}
                </div>
              </div>
            </template>
            <!-- <template v-if="column.dataIndex === 'open'">
              <button class="open_button" @click="openPopup(record.id)">
                <span class="material-symbols-outlined view_icon">expand_content</span>
                <span>열기</span>
              </button>
            </template> -->
          </template>
        </a-table>
      </div>
    </div>
  </div>
  <GlobalPopupWithOverlay ref="openOrUpdateHtml">
    <HtmlMakerView :id="selectedId" :username="username" @closePopup="closePopup" />
  </GlobalPopupWithOverlay>
</template>
<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { ref, onMounted } from 'vue'
import HtmlMakerView from './HtmlMakerView.vue'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'

function getRandomColor() {
  // Generate random RGB values
  const r = Math.floor(Math.random() * 150 + 55) // 55-255 for better visibility
  const g = Math.floor(Math.random() * 200 + 5)
  const b = Math.floor(Math.random() * 200 + 50)
  return `rgb(${r}, ${g}, ${b})`
}

const openOrUpdateHtml = ref(false)
const selectedId = ref(null)
function openPopup(id) {
  selectedId.value = id
  openOrUpdateHtml.value.showPopup()
}

function closePopup(result, needsRefresh) {
  openOrUpdateHtml.value.closePopup()
  if (needsRefresh) currentPage.value = 1
  if (result) fetchHtmlHtmls()
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
  fetchHtmlHtmls()
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
    // width: '40%'
    // width: 500
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
    // width: 120
  },
  {
    title: '날짜',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
    width: 150
  }
  // {
  //   title: '열기',
  //   dataIndex: 'open',
  //   key: 'open',
  //   width: 120,
  //   // align: 'start'
  //   alignContent: 'center'
  // }
])

const fetchHtmlHtmls = async () => {
  await fetchUserInfo()
  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-htmls', {
      method: 'POST',
      body: JSON.stringify({
        pageNumber: currentPage.value,
        perPage: rowLimit.value
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()
    htmlContents.value = decodedResponse.htmls
    totalCount.value = decodedResponse.total_count

    console.log(decodedResponse.htmls)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
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
const mvnos = ref([])
async function fetchPlicyinfo() {
  console.log('fetch policy info called')
  try {
    const response = await fetchWithTokenRefresh('agent/getPolicyInitInfo', { method: 'GET' })
    const decodedResponse = await response.json()
    console.log(decodedResponse.data)
    if (!response.ok) throw 'Fetch plicy info error'

    mvnos.value = decodedResponse?.data?.mvno_cd_list
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
  }
}

onMounted(fetchHtmlHtmls)
onMounted(fetchPlicyinfo)
</script>

<style scoped>
.htmls_container {
  /* display: flex; */
  /* flex-flow: column; */
  margin: 20px;
  box-sizing: border-box;
  margin-bottom: 100px;
}

.pagination {
  margin-bottom: 10px;
}
.pagination :deep(button) {
  min-height: unset;
}
.add_new_button {
  width: auto;
  min-width: 120px;
  align-self: end;
  margin-bottom: 20px;
}

.table {
  max-width: 1200px;
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

/* .clickable_title {
  text-decoration: underline;
} */

.clickable_title:hover {
  color: var(--main-color);
  cursor: pointer;
}
</style>
