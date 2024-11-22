<template>
  <div class="html_editor_container">
    <div class="top_actions">
      <div class="title_group">
        <label>정책등록제목</label>
        <!-- <input v-model="title" :disabled="!canEdit" /> -->
        <input v-model="title" />
      </div>

      <div class="type_selector">
        <label>유형</label>
        <a-select
          v-model:value="selectedType"
          :style="{ width: '100%' }"
          @change="selectTypeChange"
          :options="
            policyData?.carrier_type?.map((i) => ({ value: i.cd, label: i.value })) ?? [
              { value: 'N/A', label: 'N/A' }
            ]
          "
        >
        </a-select>
      </div>

      <div class="agent_selector">
        <label>대리점</label>
        <a-select
          :disabled="!selectedType"
          v-model:value="selectedAgent"
          :style="{ width: '100%' }"
          :options="agentCdList?.map((i) => ({ value: i.agent_cd, label: i.agent_nm })) || []"
        >
        </a-select>
      </div>

      <div class="date_picker">
        <label>정책년월</label>
        <a-date-picker
          v-model:value="selectedMonth"
          @clear="selectedMonth = null"
          picker="month"
        ></a-date-picker>
      </div>
    </div>

    <div v-if="policyData?.mvno_cd_list?.length > 0">
      <label style="font-weight: 600; margin-bottom: 5px">변경통신사</label>
      <div class="mvnos_buttons">
        <div
          v-for="(mvno, index) in policyData?.mvno_cd_list"
          :key="index"
          @click="
            () => {
              if (selectedMvnos.has(mvno.mvno_cd)) {
                selectedMvnos.delete(mvno.mvno_cd)
              } else {
                selectedMvnos.add(mvno.mvno_cd)
              }
            }
          "
          :class="{ selected: selectedMvnos.has(mvno.mvno_cd) }"
        >
          {{ mvno.mvno_nm }}
        </div>
      </div>
    </div>

    <template v-if="htmlFetched">
      <Editor
        api-key="no-api-key"
        :init="editorConfig"
        tinymce-script-src="/vendor/tinymce/tinymce.min.js"
        v-model="editorContent"
      />
      <!-- :disabled="!canEdit" -->
    </template>

    <div class="buttons">
      <button class="close_button" @click="$emit('closePopup', false, false)">닫기</button>
      <!-- <button class="delete_button" @click="deleteHtml">삭제</button> -->
      <button class="delete_button" @click="isDeleteModalVisible = true">삭제</button>
      <button @click="submitForm">저장</button>
    </div>

    <!-- delete confirmation modal -->
    <a-modal
      v-model:visible="isDeleteModalVisible"
      title="삭제 확인"
      :closable="false"
      :maskClosable="false"
    >
      <p>콘텐츠를 삭제하시겠습니까? 삭제하면 복구할 수 없습니다.</p>
      <template #footer>
        <a-button key="cancel" @click="isDeleteModalVisible = false">취소</a-button>
        <a-button key="delete" type="primary" danger @click="deleteHtml">삭제</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import dayjs from 'dayjs'

const policyData = ref()
const selectedType = ref()
const selectedAgent = ref()
const selectedMvnos = ref(new Set())
const selectedMonth = ref()
const agentCdList = ref()

const isDeleteModalVisible = ref(false)

const props = defineProps({ id: { type: String, default: null } })

const emit = defineEmits(['closePopup'])

const title = ref('기본 제목')
const editorContent = ref()

const editorConfig = {
  selector: '#about',
  language: 'ko_KR', // Korean language code
  language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/langs/ko_KR.js',
  menubar: false,
  branding: false,
  plugins:
    'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount',
  toolbar: `undo redo fontsizeinput fontfamily lineheight  bold italic backcolor forecolor link customImageUpload insertdatetime media table pagebreak wordcount
  alignleft aligncenter alignright alignjustify bullist numlist outdent indent removeformat charmap emoticons searchreplace visualblocks code fullscreen preview print`,
  license_key: 'gpl',
  height: '80%',
  width: '100%',
  // content_style: 'body { text-align: center; }',
  paste_data_images: true,
  automatic_uploads: false,

  // custom setup
  setup: function (editor) {
    editor.ui.registry.addButton('customImageUpload', {
      icon: 'image',
      tooltip: '이미지 업로드',
      onAction: function () {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')

        input.onchange = async function () {
          const file = this.files[0]
          uploadImage(file, editor)
        }

        input.click()
      }
    })

    editor.on('paste', async function (e) {
      var items = (e.clipboardData || e.originalEvent.clipboardData).items
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault()
          var blob = items[i].getAsFile()
          await uploadImage(blob, editor)
          return
        }
      }
    })

    editor.on('drop', async function (e) {
      const dataTransfer = e.dataTransfer
      const files = dataTransfer.files

      if (files.length > 0) {
        e.preventDefault()
        for (let file of files) {
          if (file.type.indexOf('image') !== -1) {
            await uploadImage(file, editor)
          }
        }
      }
    })
  }
}

async function uploadImage(file, editor) {
  editor.setProgressState(true)
  try {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('filename', file.name)

    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'upload-html-image', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const decodedResponse = await response.json()
    editor.insertContent(
      `<img src="${decodedResponse.path}" alt="${file.name}" style="width: auto; height: 400px;" />`
    )
  } catch (error) {
    useSnackbarStore().show('Image upload failed: ' + error.toString())
  } finally {
    editor.setProgressState(false)
  }
}

const submitForm = async () => {
  if (!title.value) {
    useSnackbarStore().show('제목을 적어주세요')
    return
  }
  if (!selectedType.value) {
    useSnackbarStore().show('유형 비어 있을 수 없습니다.')
    return
  }

  if (!selectedAgent.value) {
    useSnackbarStore().show('대리점 비어 있을 수 없습니다.')
    return
  }
  if (!selectedMonth.value) {
    useSnackbarStore().show('정책년월 비어 있을 수 없습니다.')
    return
  }

  if (!editorContent.value) {
    useSnackbarStore().show('내용은 비어 있을 수 없습니다.')
    return
  }

  try {
    const accessToken = localStorage.getItem('accessToken')
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'save-html-string', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({
        access_token: accessToken,
        id: props.id,
        title: title.value,
        html_string: editorContent.value,
        carrier_type: selectedType.value,
        selected_agent: selectedAgent.value,
        policy_date_month: selectedMonth.value.format('YYYY-MM'),
        selected_mvnos: Array.from(selectedMvnos.value)
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()

    useSnackbarStore().show(decodedResponse?.message ?? 'Somethign is wrong')
    if (decodedResponse.success) emit('closePopup', true, true)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  }
}

async function fetchPlicyinfo() {
  // console.log('fetch policy info called')
  try {
    const response = await fetchWithTokenRefresh('agent/getPolicyInitInfo', { method: 'GET' })
    const decodedResponse = await response.json()
    // console.log(decodedResponse.data)

    policyData.value = decodedResponse.data
    agentCdList.value = policyData.value?.agent_cd_list
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
  }
}

function selectTypeChange(newValue) {
  // selectedtype triggeres agentList change
  agentCdList.value = policyData.value?.agent_cd_list
  agentCdList.value = policyData.value?.agent_cd_list?.filter((item) =>
    item?.carrier_type_list?.includes(newValue)
  )
  // default changes to first item
  selectedAgent.value = agentCdList.value?.[0]?.agent_cd
}

const htmlFetched = ref(true)
async function fetchHtmlContent() {
  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-html', {
      method: 'POST',
      body: JSON.stringify({ id: props.id })
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const decodedResponse = await response.json()
    editorContent.value = decodedResponse?.html?.content
    title.value = decodedResponse?.html?.title

    //this converts str date to dayjs
    const dateStr = decodedResponse?.html?.policyDateMonth
    const parsedDate = dayjs(dateStr, 'YYYY-MM')
    if (parsedDate.isValid()) selectedMonth.value = parsedDate

    decodedResponse?.html?.selectedMvnos?.forEach((item) => selectedMvnos.value.add(item))

    selectedType.value = decodedResponse?.html?.carrierType
    selectedAgent.value = decodedResponse?.html?.selectedAgent

    // console.log(decodedResponse.html)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  } finally {
    htmlFetched.value = true
  }
}

async function deleteHtml() {
  const accessToken = localStorage.getItem('accessToken')
  if (!props.id) return
  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'delete-html', {
      method: 'POST',
      body: JSON.stringify({ id: props.id, accessToken: accessToken })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const decodedResponse = await response.json()
    // console.log(decodedResponse.htmls)
    useSnackbarStore().show(decodedResponse?.message ?? 'Somethign is wrong')
    if (decodedResponse.success) emit('closePopup', true, true)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  }
}

onMounted(async () => {
  await fetchPlicyinfo()
  if (props.id) {
    htmlFetched.value = false
    fetchHtmlContent()
  }
})
</script>

<style scoped>
.html_editor_container {
  width: 100%;
  background-color: #fff;
  padding: 20px;
  display: flex;
  flex-flow: column;
  gap: 20px;
  box-sizing: border-box;
}

.top_actions {
  display: flex;
  flex-flow: row;
  flex-flow: wrap;
  gap: 20px;
}

.title_group {
  width: 100%;
  max-width: 700px;
}

.type_selector {
  width: 150px;
}

.agent_selector {
  width: 200px;
}

.title_group input {
  font-weight: 600;
}

.date_picker {
  width: 200px;
}

.mvnos_buttons {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  user-select: none;
}

.mvnos_buttons * {
  background-color: #0000001d;
  border: 1px solid #0000001d;
  padding: 7px 10px;
  border-radius: 40px;
  text-align: center;
  min-width: 80px;
}

.mvnos_buttons .selected {
  background-color: var(--main-color);
  color: #fff;
}

.mvnos_buttons *:hover {
  cursor: pointer;
  opacity: 0.5;
}

.buttons {
  display: flex;
  flex-flow: row;
  gap: 20px;
  /* margin-top: 20px; */
  /* margin-bottom: 20px; */
  /* margin: 20px 0; */
  box-sizing: border-box;
  justify-content: center;
}

.ant-picker-body.button {
  width: 20px;
}

.buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  background-color: var(--main-color);
  width: 120px;
}

.close_button {
  background-color: #7b7b7b !important;
}

.delete_button {
  background-color: #e41c1c !important;
}

.ant-picker-dropdown {
  background-color: #e41c1c !important;
}
</style>
