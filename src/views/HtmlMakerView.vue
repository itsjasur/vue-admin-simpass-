<template>
  <div class="html_editor_container">
    <div class="editor">
      <div class="title_group">
        <label>정책등록제목</label>
        <input v-model="title" :disabled="!canEdit" />
      </div>
      <template v-if="htmlFetched">
        <Editor
          api-key="no-api-key"
          :init="editorConfig"
          tinymce-script-src="/vendor/tinymce/tinymce.min.js"
          v-model="editorContent"
          :disabled="!canEdit"
        />
      </template>

      <div class="buttons">
        <button class="close_button" @click="$emit('closePopup', false, false)">닫기</button>
        <button v-if="canDelete" class="delete_button" @click="deleteHtml">삭제</button>
        <button v-if="canEdit" @click="submitForm">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { useSnackbarStore } from '@/stores/snackbar'

const props = defineProps({
  id: { type: String, default: null },
  username: { type: String, default: null }
})

const emit = defineEmits(['closePopup'])

const title = ref('기본 제목')
const creator = ref()
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
  if (!editorContent.value) {
    useSnackbarStore().show('내용은 비어 있을 수 없습니다.')
    return
  }

  try {
    const accessToken = localStorage.getItem('accessToken')
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'save-html-string', {
      method: 'POST',
      body: JSON.stringify({
        id: props.id,
        htmlString: editorContent.value,
        title: title.value,
        accessToken: accessToken
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

const htmlFetched = ref(false)

const fetchHtmlContent = async () => {
  if (!props.id) {
    htmlFetched.value = true
    return
  }

  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-html', {
      method: 'POST',
      body: JSON.stringify({ id: props.id })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()
    editorContent.value = decodedResponse?.html?.content
    title.value = decodedResponse?.html?.title
    creator.value = decodedResponse?.html?.creator

    // console.log(decodedResponse.htmls)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  } finally {
    htmlFetched.value = true
  }
}

const canDelete = computed(() => {
  if (!props.id) return false
  if (props.username === creator.value) return true
  return false
})

const canEdit = computed(() => {
  if (!props.id) return true
  return props.username === creator.value
})

async function deleteHtml() {
  const accessToken = localStorage.getItem('accessToken')
  if (!props.id) return
  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'delete-html', {
      method: 'POST',
      body: JSON.stringify({ id: props.id, accessToken: accessToken })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()
    console.log(decodedResponse.htmls)

    useSnackbarStore().show(decodedResponse?.message ?? 'Somethign is wrong')
    if (decodedResponse.success) emit('closePopup', true, true)
  } catch (error) {
    console.error('Error uplading html:', error)
    useSnackbarStore().show(error.toString())
  }
}

onMounted(fetchHtmlContent)
</script>

<style scoped>
.html_editor_container {
  box-sizing: border-box;
  margin: 30px;
  border-radius: 8px;
  width: 100%;
  background-color: #fff;
  overflow-y: scroll;
}

.editor {
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
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
