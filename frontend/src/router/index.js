import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { TEST_MODE } from '@/config'
import { getMenuIdFromPreSavedQR } from '@/utils/testData'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/login',
      redirect: '/',
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/pages/SignUp.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/pages/Onboarding.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/menu/:merchantSlug/:menuName',
      name: 'menu-by-slug',
      component: () => import('@/pages/MenuDisplay.vue'),
      meta: { public: true },
    },
    {
      path: '/menu/:menuId?',
      name: 'menu',
      component: () => import('@/pages/MenuDisplay.vue'),
      meta: { public: true },
    },
    {
      path: '/basket',
      name: 'basket',
      component: () => import('@/pages/Basket.vue'),
      meta: { public: true },
    },
    {
      path: '/qr',
      name: 'qr',
      component: () => import('@/pages/QRManagement.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ocr',
      name: 'ocr',
      component: () => import('@/pages/OCRImport.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/pages/OrderManagement.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/menu-management',
      name: 'menu-management',
      component: () => import('@/pages/MenuEdit.vue'),
      meta: { requiresAuth: true },
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Import the store here to avoid circular dependency issues
  const authStore = useAuthStore()
  
      // Check for custom domain redirect (for pre-printed QR codes)
      // This handles redirects from old domain/IP to custom domain
      if (to.meta.public && to.path.startsWith('/menu/')) {
        try {
          // Check if merchant has custom domain configured
          const currentOrigin = window.location.origin
          const hostname = window.location.hostname
          const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
          const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
          
          // Only redirect if accessing from IP address or localhost (not from custom domain)
          if (isIPAddress || isLocalhost) {
            const menuId = to.params.menuId
            let customDomain = null
            
            // In TEST_MODE, check localStorage for custom domain
            if (TEST_MODE) {
              customDomain = localStorage.getItem('customDomain') || null
              
              // Also check if this is a pre-saved QR code
              const currentOrigin = window.location.origin
              const fullUrl = `${currentOrigin}${to.fullPath}`
              const urlWithoutProtocol = fullUrl.replace(/^https?:\/\//, '')
              const preSavedMenuId = getMenuIdFromPreSavedQR(urlWithoutProtocol)
              
              if (preSavedMenuId && customDomain) {
                // This is a pre-saved QR code, redirect to custom domain
                let redirectUrl = customDomain.trim()
                if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                  redirectUrl = `https://${redirectUrl}`
                }
                const redirectTo = `${redirectUrl}/menu/${preSavedMenuId}${to.fullPath.includes('?') ? to.fullPath.substring(to.fullPath.indexOf('?')) : ''}`
                console.log('Redirecting pre-saved QR code to custom domain:', redirectTo)
                window.location.href = redirectTo
                return
              }
            } else {
              // Production mode - try to get merchant's custom domain from backend
              if (menuId) {
                try {
                  const response = await fetch(`/api/merchants/menu/${menuId}/merchant`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  })
                  if (response.ok) {
                    const data = await response.json()
                    customDomain = data.data?.customDomain
                  }
                } catch (err) {
                  // If we can't fetch merchant data, continue normally
                  console.log('Could not fetch merchant custom domain, continuing normally', err)
                }
              }
            }
            
            // Redirect if custom domain is configured
            if (customDomain && customDomain.trim()) {
              // Ensure custom domain has protocol
              let redirectUrl = customDomain.trim()
              if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                redirectUrl = `https://${redirectUrl}`
              }
              
              // Preserve the path and query parameters
              const newPath = to.fullPath
              const redirectTo = `${redirectUrl}${newPath}`
              
              console.log('Redirecting to custom domain:', redirectTo)
              window.location.href = redirectTo
              return // Don't continue with navigation
            }
          }
        } catch (err) {
          // If redirect check fails, continue normally
          console.log('Custom domain redirect check failed, continuing normally', err)
        }
      }
  
  // Check authentication status
  const isAuth = await authStore.checkAuth()

  const isAuthenticated = authStore.isAuthenticated || isAuth
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const isPublic = to.meta.public

  console.log('Route Guard:', { to: to.path, isAuthenticated, requiresAuth, requiresGuest, isPublic })

  // Public routes (menu, basket) - always allow
  if (isPublic) {
    next()
    return
  }

  // Routes that require authentication (dashboard, qr, ocr, onboarding)
  if (requiresAuth && !isAuthenticated) {
    next('/')
    return
  }

  // Routes that require guest (login, signup)
  if (requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router


