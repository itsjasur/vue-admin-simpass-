<template>
  <div class="html_editor_container">
    <div class="editor">
      <div class="title_group" style="width: 600px">
        <label>제목</label>
        <input v-model="title" />
      </div>

      <Editor
        api-key="no-api-key"
        :init="editorConfig"
        tinymce-script-src="/vendor/tinymce/tinymce.min.js"
        v-model="editorContent"
      />

      <div class="buttons">
        <!-- <button @click="logHtml">Log HTML</button> -->
        <button class="close_button" @click="$emit('closePopup', false, false)">닫기</button>
        <button class="delete_button" @click="false">삭제</button>
        <button @click="submitForm">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { useSnackbarStore } from '@/stores/snackbar'

const props = defineProps({
  id: { type: String, default: null }
})

const emit = defineEmits(['closePopup'])

const title = ref('기본 제목')
const editorContent = ref()
const editorConfig = {
  selector: '#about',
  // language: 'ko_KR', // Korean language code
  // language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/langs/ko_KR.js',
  menubar: false,
  branding: false,
  plugins:
    'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount',
  toolbar: `undo redo | link customImageUpload | bold italic backcolor | insertdatetime media table | pagebreak | wordcount |
   alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | 
   removeformat | charmap emoticons | searchreplace visualblocks code | fullscreen preview`,
  license_key: 'gpl',
  height: '80%',
  width: '100%',
  // content_style: 'body { text-align: center; }',

  // Custom image upload button
  setup: function (editor) {
    editor.ui.registry.addButton('customImageUpload', {
      icon: 'image',
      tooltip: 'Upload Image',
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
  }
}

const logHtml = () => {
  console.log(editorContent.value)
}

const submitForm = async () => {
  // console.log('Submitting form with HTML:', editorContent.value)

  if (!title.value) {
    useSnackbarStore().show('제목을 적어주세요')
    return
  }

  if (!editorContent.value) {
    useSnackbarStore().show('내용은 비어 있을 수 없습니다.')
    return
  }

  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'save-html-string', {
      method: 'POST',
      body: JSON.stringify({
        id: '123123',
        htmlString: editorContent.value,
        title: 'title',
        creator: 'jasur'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()
    useSnackbarStore().show(decodedResponse?.message ?? 'Somethign is wrong')
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  }
}

async function uploadImage(file, editor) {
  try {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('filename', 'filename')

    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'upload-html-image', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const decodedResponse = await response.json()
    editor.insertContent(
      `<img src="${decodedResponse.path}" alt="image" width="200" height="200" />`
    )
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
    editor.setProgressState(false)
  }
}

const fetchHtmlContent = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-html', {
      method: 'POST',
      body: JSON.stringify({ id: props.id })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()
    editorContent.value = decodedResponse.html.content
    title.value = decodedResponse.html.title

    console.log(decodedResponse.htmls)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  }
}

onMounted(fetchHtmlContent)
</script>

<style scoped>
.html_editor_container {
  /* position: absolute; */

  box-sizing: border-box;
  margin: 30px;
  border-radius: 8px;
  /* height: 100vh; */
  width: 100%;
  background-color: #fff;
  overflow-y: scroll;
}

.editor {
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;

  /* display: flex;
  flex-flow: column; */
  /* align-items: center; */
  /* justify-content: center; */
}

.title_group {
  margin-bottom: 20px;
}

.title_group label {
  font-size: 15px;
  color: #000;
}

.title_group input {
  font-weight: 600;
}

.buttons {
  display: flex;
  flex-flow: row;
  gap: 20px;
  margin-top: 20px;
  justify-content: center;
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
</style>
