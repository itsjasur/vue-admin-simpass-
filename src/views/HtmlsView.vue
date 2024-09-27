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
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'open'">
              <button class="open_button" @click="openPopup(record.id)">
                <span class="material-symbols-outlined view_icon">expand_content</span>
                <span>열기</span>
              </button>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
  <GlobalPopupWithOverlay ref="openOrUpdateHtml">
    <HtmlMakerView :id="selectedId" @closePopup="closePopup" />
  </GlobalPopupWithOverlay>
</template>
<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { ref, onMounted } from 'vue'
import HtmlMakerView from './HtmlMakerView.vue'

const openOrUpdateHtml = ref(false)
const selectedId = ref(null)
function openPopup(id) {
  selectedId.value = id
  openOrUpdateHtml.value.showPopup()
}

function closePopup(result, needsRefresh) {
  openOrUpdateHtml.value.closePopup()
  if (needsRefresh) currentPage.value = 1
  if (result) fetchHtmlContents()
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
  fetchHtmlContents()
}

const columns = ref([
  {
    title: '제목',
    dataIndex: 'title',
    key: 'title',
    sorter: (a, b) => (a.title ?? '').localeCompare(b.title ?? '')
    // width: '60%'
    // width: 500
  },
  {
    title: '날짜',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
    width: 200
  },

  {
    title: '열기',
    dataIndex: 'open',
    key: 'open',
    width: 120,
    // align: 'start'
    alignContent: 'center'
  }
])

const fetchHtmlContents = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-htmls', {
      method: 'POST',
      body: JSON.stringify({ pageNumber: currentPage.value })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()
    htmlContents.value = [
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls,
      ...decodedResponse.htmls
    ]

    totalCount.value = decodedResponse.total_count

    console.log(decodedResponse.htmls)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  }
}

onMounted(() => {
  fetchHtmlContents()
})
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
</style>
