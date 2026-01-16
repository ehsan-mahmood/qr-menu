// Demo mode localStorage persistence layer
// Enhances existing testData.js with localStorage for GitHub Pages demo persistence
// Uses testOrders and testAnalytics from testData.js as initial/default data

import { testOrders, testAnalytics } from './testData'

const STORAGE_KEYS = {
  ORDERS: 'demo_orders',
  MENU_SCANS: 'demo_menu_scans',
  MENU_VIEWS: 'demo_menu_views',
  ITEM_CLICKS: 'demo_item_clicks',
}

// Initialize with existing test data if localStorage is empty
export function initDemoStorage() {
  // Initialize orders from testOrders if localStorage is empty
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([...testOrders]))
  }
  
  // Initialize analytics tracking if empty
  if (!localStorage.getItem(STORAGE_KEYS.MENU_SCANS)) {
    localStorage.setItem(STORAGE_KEYS.MENU_SCANS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.MENU_VIEWS)) {
    localStorage.setItem(STORAGE_KEYS.MENU_VIEWS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.ITEM_CLICKS)) {
    localStorage.setItem(STORAGE_KEYS.ITEM_CLICKS, JSON.stringify({}))
  }
}

// Orders storage - wraps existing testOrders with localStorage persistence
export const demoOrderStorage = {
  getAll() {
    try {
      const orders = localStorage.getItem(STORAGE_KEYS.ORDERS)
      return orders ? JSON.parse(orders) : [...testOrders] // Fallback to testOrders
    } catch (error) {
      console.error('Error reading orders from localStorage:', error)
      return [...testOrders] // Fallback to testOrders
    }
  },

  add(order) {
    try {
      const orders = this.getAll()
      orders.unshift(order) // Add to beginning (most recent first)
      // Keep only last 100 orders
      if (orders.length > 100) {
        orders.splice(100)
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
      return order
    } catch (error) {
      console.error('Error saving order to localStorage:', error)
      throw error
    }
  },

  update(orderId, updates) {
    try {
      const orders = this.getAll()
      const index = orders.findIndex(o => o.orderId === orderId)
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updates }
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
        return orders[index]
      }
      return null
    } catch (error) {
      console.error('Error updating order in localStorage:', error)
      throw error
    }
  },

  getById(orderId) {
    const orders = this.getAll()
    return orders.find(o => o.orderId === orderId) || null
  },

  getRecent(limit = 10) {
    const orders = this.getAll()
    return orders.slice(0, limit)
  },
}

// Analytics storage - tracks events and merges with testAnalytics structure
export const demoAnalyticsStorage = {
  trackScan(qrToken) {
    try {
      const scans = this.getScans()
      scans.push({
        qrToken,
        timestamp: new Date().toISOString(),
      })
      // Keep only last 1000 scans
      if (scans.length > 1000) {
        scans.splice(0, scans.length - 1000)
      }
      localStorage.setItem(STORAGE_KEYS.MENU_SCANS, JSON.stringify(scans))
    } catch (error) {
      console.error('Error tracking scan:', error)
    }
  },

  trackView(menuId) {
    try {
      const views = this.getViews()
      views.push({
        menuId,
        timestamp: new Date().toISOString(),
      })
      // Keep only last 1000 views
      if (views.length > 1000) {
        views.splice(0, views.length - 1000)
      }
      localStorage.setItem(STORAGE_KEYS.MENU_VIEWS, JSON.stringify(views))
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  },

  trackClick(itemName) {
    try {
      const clicks = this.getClicks()
      clicks[itemName] = (clicks[itemName] || 0) + 1
      localStorage.setItem(STORAGE_KEYS.ITEM_CLICKS, JSON.stringify(clicks))
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  },

  trackOrder() {
    // Orders tracked via demoOrderStorage, no separate tracking needed
    // This method kept for API consistency but doesn't need to do anything
  },

  getScans() {
    try {
      const scans = localStorage.getItem(STORAGE_KEYS.MENU_SCANS)
      return scans ? JSON.parse(scans) : []
    } catch (error) {
      return []
    }
  },

  getViews() {
    try {
      const views = localStorage.getItem(STORAGE_KEYS.MENU_VIEWS)
      return views ? JSON.parse(views) : []
    } catch (error) {
      return []
    }
  },

  getClicks() {
    try {
      const clicks = localStorage.getItem(STORAGE_KEYS.ITEM_CLICKS)
      return clicks ? JSON.parse(clicks) : {}
    } catch (error) {
      return {}
    }
  },

  // Get top items based on clicks, merged with testAnalytics structure
  getTopItems(limit = 10) {
    const clicks = this.getClicks()
    const clickItems = Object.entries(clicks)
      .map(([itemName, count]) => ({ itemName, clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit)
    
    // Use testAnalytics.topItems as base structure, enhance with localStorage clicks
    const baseItems = testAnalytics.topItems || []
    
    // Merge localStorage clicks with base analytics data
    return clickItems.map(item => {
      const baseItem = baseItems.find(b => b.itemName === item.itemName)
      return {
        itemName: item.itemName,
        scans: baseItem?.scans || Math.floor(item.clicks * 1.3),
        clicks: item.clicks,
        category: baseItem?.category || 'general',
      }
    }).slice(0, limit)
  },
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initDemoStorage()
}
