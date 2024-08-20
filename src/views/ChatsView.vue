<template>
  <div class="container">
    <div class="chatrooms_section">
      <div class="search-chatroom">
        <input
          type="text"
          id="username"
          name="username"
          @input="webSocketStore.getChatRooms(searchText)"
          placeholder="Search"
          v-model="searchText"
        />
      </div>

      <div class="chatrooms">
        <template v-for="(room, index) in webSocketStore.chatRooms" :key="index">
          <div
            @click="selectRoom(room)"
            :class="['chatroom', { isSelected: webSocketStore.selectedRoomId === room?.room_id }]"
          >
            <span> {{ room.partner_name }}</span>

            <div v-if="room?.agent_unread_count !== 0" class="unread_count_badge">
              {{ room.agent_unread_count }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="chats_section">
      <ChatsComponent />
    </div>
  </div>

  <template v-if="!sideMenuHanlder.isDesktop">
    <GlobalPopupWithOverlay ref="chatPopupRef">
      <div class="mobile_chats_popup">
        <div class="fixed-header">
          <span @click="closeChatsPopup" class="material-symbols-outlined close-button">
            cancel
          </span>
        </div>
        <ChatsComponent />
      </div>
    </GlobalPopupWithOverlay>
  </template>
</template>

<script setup>
import { useWebSocketStore } from '@/stores/webscoket-store'
import { onMounted, ref } from 'vue'
import ChatsComponent from '@/components/ChatsComponent.vue'
import GlobalPopupWithOverlay from '../components/GlobalPopupWithOverlay.vue'
import { useSideMenuStore } from '@/stores/side-menu'

const sideMenuHanlder = useSideMenuStore()

const chatPopupRef = ref()

function selectRoom(room) {
  if (room?.room_id) {
    webSocketStore.selectedRoomId = room?.room_id
    webSocketStore.joinRoom()
  }
  //opens chats popup if not desktop
  if (!sideMenuHanlder.isDesktop) {
    chatPopupRef.value.showPopup()
  }
}

function closeChatsPopup() {
  if (!sideMenuHanlder.isDesktop) {
    webSocketStore.selectedRoomId = null
    chatPopupRef.value.closePopup()
  }
}

const webSocketStore = useWebSocketStore()
const searchText = ref('')

const checkConnection = () => {
  if (!webSocketStore.isConnected) {
    setTimeout(checkConnection, 100) // checks every 100ms
  } else {
    webSocketStore.getChatRooms('')
  }
}

onMounted(() => {
  console.log('chats mounted')
  checkConnection()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;

  display: flex;
  flex-flow: row;
  /* background-color: pink; */
}

.chatrooms_section {
  display: flex;
  flex-flow: column;
  width: 350px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
}

.search-chatroom {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  box-sizing: border-box;
  align-content: center;
  padding: 0;
}

.chatrooms {
  padding: 0 20px;
  padding-top: 60px;
  overflow-y: auto;
}

.chatroom {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 5px;
  font-weight: 600;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
}

.chatroom:hover {
  cursor: pointer;
  background-color: #e8e8e8;
}

.chatroom.isSelected {
  background-color: #dedede;
}

.unread_count_badge {
  /* background-color: var(--main-color); */
  background-color: #e42c2c;
  height: 24px;
  min-width: 20px;
  padding: 0 2px;
  border-radius: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  line-height: 1;

  color: #fff;
  font-size: 14px;
}

.chats_section {
  flex: 1;
  background-color: #fff;
}

.mobile_chats_popup {
  width: 100%;
  /* height: 100%; */
  /* display: flex; */
  /* flex-flow: column; */
  /* box-sizing: border-box; */
  position: relative;
}

.fixed-header {
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-height: 50px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .chatrooms_section {
    width: 100%;
  }

  .chats_section {
    display: none;
  }
}
</style>
