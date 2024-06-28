import { useAuthenticationStore } from '../stores/authentication'

// Function to refresh the access token
export async function refreshToken() {
  try {
    let currentRefreshToken = localStorage.getItem('refreshToken')

    if (!currentRefreshToken) {
      throw 'No Refresh token available'
    }

    const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/refreshtoken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // any other necessary headers?
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken })
    })

    if (response.ok) {
      const data = await response.json()
      const newAccessToken = data.accessToken
      const newRefreshToken = data.accessToken
      // saving the new access token in lclstorage
      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
    } else {
      throw 'Could not refresh the token'
    }
  } catch (error) {
    useAuthenticationStore().logout()
    throw error
  }
}

// function to make HTTP requests with token refresh logic
export async function fetchWithTokenRefresh(url, options) {
  let response
  let fullUrl = import.meta.env.VITE_API_BASE_URL + url
  let accessToken = localStorage.getItem('accessToken')

  options.headers = { Authorization: `Bearer ${accessToken}` }

  if (options.method === 'POST' && options.body && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body)
  }

  //if body is not form data, content-type is always application/json
  if (!(options.body instanceof FormData)) options.headers['Content-Type'] = 'application/json'
  try {
    response = await fetch(fullUrl, options)

    // const decodedResponse = await response.json()
    // console.log(decodedResponse)

    if (response.status === 401 && !options._retry) {
      options._retry = true
      const newAccessToken = await refreshToken()
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken)
        options.headers['Authorization'] = `Bearer ${newAccessToken}`
        return fetchWithTokenRefresh(fullUrl, options)
      }
    }
    return response
  } catch (error) {
    throw error
  }
}
