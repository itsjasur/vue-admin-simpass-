let refreshPromise = null // Single promise for token refresh

export async function refreshToken() {
  console.log('token refresh called')

  // If a refresh is already in progress, return the existing promise
  if (refreshPromise) {
    return refreshPromise
  }

  try {
    refreshPromise = (async () => {
      const currentRefreshToken = localStorage.getItem('refreshToken')
      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/refreshtoken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      if (!data.accessToken || !data.refreshToken) {
        throw new Error('Invalid token response format')
      }

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return data.accessToken
    })()

    return await refreshPromise
  } catch (error) {
    useAuthenticationStore().logout()
    throw error
  } finally {
    refreshPromise = null
  }
}

export async function fetchWithTokenRefresh(url, options = {}, retryCount = 0) {
  const MAX_RETRIES = 2
  const fullUrl = import.meta.env.VITE_API_BASE_URL + url
  const accessToken = localStorage.getItem('accessToken')

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`
  }

  if (options.method === 'POST' && options.body && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body)
    options.headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(fullUrl, options)

    if (response.status === 401 && retryCount < MAX_RETRIES) {
      try {
        const newAccessToken = await refreshToken()
        options.headers['Authorization'] = `Bearer ${newAccessToken}`
        return fetchWithTokenRefresh(url, options, retryCount + 1)
      } catch (refreshError) {
        useAuthenticationStore().logout()
        throw refreshError
      }
    }

    return response
  } catch (error) {
    throw error
  }
}
