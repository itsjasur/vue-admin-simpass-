<template>
  <div class="editor">
    <Editor
      api-key="no-api-key"
      :init="editorConfig"
      tinymce-script-src="/vendor/tinymce/tinymce.min.js"
      v-model="editorContent"
    />
  </div>

  <div class="buttons">
    <button @click="logHtml">Log HTML</button>
    <button @click="submitForm">Submit Form</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Editor from '@tinymce/tinymce-vue'

const editorContent = ref()
const editorConfig = {
  selector: '#about',
  // language: 'ko_KR', // Korean language code
  // language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/langs/ko_KR.js',
  menubar: false,
  branding: false,
  plugins:
    'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount',
  toolbar:
    'undo redo | link customImageUpload | bold italic backcolor | insertdatetime media table | pagebreak | wordcount | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | charmap emoticons | searchreplace visualblocks code | fullscreen preview',
  license_key: 'gpl',
  // Add image upload configurations
  images_upload_url: '/your-image-upload-endpoint', // Replace with your server endpoint
  automatic_uploads: true,
  file_picker_types: 'image',
  image_title: true,
  image_advtab: true,
  image_dimensions: false,

  // Custom image upload button
  setup: function (editor) {
    editor.ui.registry.addButton('customImageUpload', {
      icon: 'image',
      tooltip: 'Upload Image',
      onAction: function () {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')

        input.onchange = function () {
          const file = this.files[0]

          editor.setProgressState(true)
          uploadImage(file, editor)
            .then((imageUrl) => {
              editor.insertContent(`<img src="${imageUrl}" alt="${file.name}" />`)
              editor.setProgressState(false)
            })
            .catch((error) => {
              console.error(error)
              editor.notificationManager.open({
                text: 'Image upload failed',
                type: 'error'
              })
              editor.setProgressState(false)
            })
        }

        input.click()
      }
    })
  }
}

const logHtml = () => {
  console.log(editorContent.value)
}

const submitForm = () => {
  console.log('Submitting form with HTML:', editorContent.value)
  // Add your form submission logic here
}
</script>

<style scoped>
.editor {
  margin-top: 100px;
}

.buttons {
  display: flex;
  flex-flow: row;
  gap: 20px;
  margin-top: 50px;
  margin-right: 10px;
  justify-content: flex-end;
}

.buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  background-color: #1b63af;
  color: white;
}
</style>
