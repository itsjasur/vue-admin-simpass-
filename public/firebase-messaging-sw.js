// public/firebase-messaging-sw.js
// importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js')
// importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js')

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js')
// importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js')

const firebaseConfig = {
  apiKey: 'AIzaSyAZK-CRaELVLTzRgWT7ESpUCHuGhtbM8w4',
  authDomain: 'simpassplatform.firebaseapp.com',
  projectId: 'simpassplatform',
  storageBucket: 'simpassplatform.appspot.com',
  messagingSenderId: '815804342158',
  appId: '1:815804342158:web:6fee3a1573be5005290edf',
  measurementId: 'G-0N60MS076C'
}

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    // icon: '/logo.png',
    silent: false,
    tag: 'notification-' + Date.now()
  }

  return self.registration
    .showNotification(notificationTitle, notificationOptions)
    .catch((error) => console.error('Error showing notification:', error))
})

// self.addEventListener('push', function (event) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload)

//   const payload = event.data.json()
//   const title = payload.notification.title
//   const options = {
//     body: payload.notification.body,
//     icon: '/logo.png',
//     sound: '/sound.mp3'
//   }

//   event.waitUntil(self.registration.showNotification(title, options))
// })
