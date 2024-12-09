import { useAuthenticationStore } from '../stores/authentication'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function refreshToken() {
  try {
    const currentRefreshToken = localStorage.getItem('refreshToken')

    if (!currentRefreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${API_BASE_URL}auth/refreshtoken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken })
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return data.accessToken
    } else {
      useAuthenticationStore().logout()
      throw new Error('Could not refresh the token')
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    throw error
  }
}

export async function fetchWithTokenRefresh(url, options = {}) {
  const fullUrl = `${API_BASE_URL}${url}`
  let accessToken = localStorage.getItem('accessToken')

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`
  }

  if (options.method === 'POST' && options.body && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body)
    options.headers['Content-Type'] = 'application/json'
  }

  try {
    let response = await fetch(fullUrl, options)

    if (response.status === 401 && !options._retry) {
      options._retry = true
      const newAccessToken = await refreshToken()
      if (newAccessToken) {
        options.headers['Authorization'] = `Bearer ${newAccessToken}`
        return fetchWithTokenRefresh(url, options)
      }
    }
    return response
  } catch (error) {
    console.error('Request failed:', error)
    throw error
  }
}
