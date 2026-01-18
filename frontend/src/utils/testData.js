// Static test data for demo/test mode
export const testMenu = {
  menuId: 'test-menu-001',
  merchantName: 'Café Demo',
  merchantSlug: 'cafe-demo',
  orderEnabled: true, // Configurable from backend: enable/disable place order button
  sections: [
    {
      id: 'sec-1',
      name: 'Breakfast',
      items: [
        {
          id: 'item-1',
          name: 'Avocado Toast',
          description: 'Smashed avocado on sourdough with cherry tomatoes and feta',
          price: 12.50,
          image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400',
          available: true,
          category: 'breakfast',
        },
        {
          id: 'item-2',
          name: 'Eggs Benedict',
          description: 'Poached eggs with hollandaise on English muffin',
          price: 14.00,
          image: `${import.meta.env.BASE_URL}eggs-benny.jpg`.replace(/\/+/g, '/'),
          available: true,
          category: 'breakfast',
        },
        {
          id: 'item-3',
          name: 'Pancake Stack',
          description: 'Fluffy pancakes with maple syrup and berries',
          price: 11.00,
          image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
          available: true,
          category: 'breakfast',
        },
      ],
    },
    {
      id: 'sec-2',
      name: 'Lunch & Dinner',
      items: [
        {
          id: 'item-4',
          name: 'Grilled Salmon',
          description: 'Atlantic salmon with seasonal vegetables and lemon butter',
          price: 24.50,
          image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400',
          available: true,
          category: 'mains',
        },
        {
          id: 'item-5',
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, basil, and tomato sauce on thin crust',
          price: 16.00,
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
          available: true,
          category: 'mains',
        },
        {
          id: 'item-6',
          name: 'Caesar Salad',
          description: 'Romaine lettuce, parmesan, croutons, and Caesar dressing',
          price: 13.50,
          image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
          available: true,
          category: 'salads',
        },
        {
          id: 'item-7',
          name: 'Beef Burger',
          description: 'Wagyu beef patty with cheese, lettuce, tomato, and fries',
          price: 18.00,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          available: true,
          category: 'mains',
        },
      ],
    },
    {
      id: 'sec-3',
      name: 'Beverages',
      items: [
        {
          id: 'item-8',
          name: 'Cappuccino',
          description: 'Espresso with steamed milk and foam',
          price: 4.50,
          image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
          available: true,
          category: 'drinks',
        },
        {
          id: 'item-9',
          name: 'Fresh Orange Juice',
          description: 'Freshly squeezed orange juice',
          price: 6.00,
          image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
          available: true,
          category: 'drinks',
        },
        {
          id: 'item-10',
          name: 'Iced Latte',
          description: 'Cold espresso with milk and ice',
          price: 5.50,
          image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
          available: true,
          category: 'drinks',
        },
      ],
    },
    {
      id: 'sec-4',
      name: 'Desserts',
      items: [
        {
          id: 'item-11',
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate cake with molten center and vanilla ice cream',
          price: 9.50,
          image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
          available: true,
          category: 'desserts',
        },
        {
          id: 'item-12',
          name: 'Tiramisu',
          description: 'Classic Italian dessert with coffee and mascarpone',
          price: 8.50,
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
          available: true,
          category: 'desserts',
        },
      ],
    },
  ],
}

export const testQRData = {
  qrToken: 'test-qr-token-001',
  tableNumber: '5',
  menuId: 'test-menu-001',
  merchantId: 'merchant-001',
}

// Pre-saved QR code menu mappings for demo/test mode
// These are the menu IDs that are supported as pre-saved QR codes
const preSavedMenuMappings = {
  'test-menu-001': {
    menuId: 'test-menu-001',
    tableLabel: 'Table 1',
  },
  'test-menu-002': {
    menuId: 'test-menu-002',
    tableLabel: 'Table 2',
  },
  'test-menu-003': {
    menuId: 'test-menu-003',
    tableLabel: 'Table 3',
  },
}

// Generate pre-saved QR codes dynamically based on current origin
// This automatically uses whatever domain/IP the app is running on
export function getPreSavedQRCodes() {
  // Get current origin (works in browser)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const host = origin.replace(/^https?:\/\//, '') // Remove protocol
    
    const codes = {}
    Object.values(preSavedMenuMappings).forEach((mapping) => {
      codes[`${host}/menu/${mapping.menuId}`] = mapping
    })
    return codes
  }
  
  // Fallback for SSR/build time - use default
  const defaultHost = '192.168.20.35:3000'
  const codes = {}
  Object.values(preSavedMenuMappings).forEach((mapping) => {
    codes[`${defaultHost}/menu/${mapping.menuId}`] = mapping
  })
  return codes
}

// Helper function to get menu ID from pre-saved QR code URL
export function getMenuIdFromPreSavedQR(url) {
  // Get current pre-saved codes (dynamically generated)
  const preSavedQRCodes = getPreSavedQRCodes()
  
  // Try exact match first
  if (preSavedQRCodes[url]) {
    return preSavedQRCodes[url].menuId
  }
  
  // Try to match by extracting the menu ID from the URL pattern
  const menuMatch = url.match(/\/menu\/([^\/\?]+)/)
  if (menuMatch) {
    const menuId = menuMatch[1]
    // Check if this menu ID exists in our pre-saved menu mappings
    if (preSavedMenuMappings[menuId]) {
      return menuId
    }
  }
  
  return null
}

// Generate hourly data for peak hours analysis
const generateHourlyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  return hours.map(hour => ({
    hour,
    hourLabel: `${hour}:00`,
    orders: hour >= 8 && hour <= 22 ? Math.floor(Math.random() * 30) + (hour >= 11 && hour <= 14 ? 20 : hour >= 18 && hour <= 20 ? 25 : 10) : Math.floor(Math.random() * 5),
    scans: hour >= 8 && hour <= 22 ? Math.floor(Math.random() * 80) + (hour >= 11 && hour <= 14 ? 50 : hour >= 18 && hour <= 20 ? 60 : 30) : Math.floor(Math.random() * 10),
  }))
}

// Generate trend data (last 7 days)
const generateTrendData = () => {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    days.push({
      date: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      items: [
        { itemName: 'Avocado Toast', scans: Math.floor(Math.random() * 30) + 20, clicks: Math.floor(Math.random() * 20) + 10 },
        { itemName: 'Cappuccino', scans: Math.floor(Math.random() * 35) + 25, clicks: Math.floor(Math.random() * 25) + 15 },
        { itemName: 'Beef Burger', scans: Math.floor(Math.random() * 25) + 15, clicks: Math.floor(Math.random() * 18) + 10 },
      ]
    })
  }
  return days
}

// Category mapping
const itemCategories = {
  'Avocado Toast': 'breakfast',
  'Eggs Benedict': 'breakfast',
  'Pancake Stack': 'breakfast',
  'Grilled Salmon': 'mains',
  'Margherita Pizza': 'mains',
  'Caesar Salad': 'salads',
  'Beef Burger': 'mains',
  'Cappuccino': 'drinks',
  'Fresh Orange Juice': 'drinks',
  'Iced Latte': 'drinks',
  'Chocolate Lava Cake': 'desserts',
  'Tiramisu': 'desserts',
}

export const testAnalytics = {
  topItems: [
    { itemName: 'Avocado Toast', scans: 156, clicks: 89, category: 'breakfast' },
    { itemName: 'Cappuccino', scans: 142, clicks: 121, category: 'drinks' },
    { itemName: 'Beef Burger', scans: 128, clicks: 94, category: 'mains' },
    { itemName: 'Grilled Salmon', scans: 98, clicks: 67, category: 'mains' },
    { itemName: 'Margherita Pizza', scans: 87, clicks: 72, category: 'mains' },
    { itemName: 'Caesar Salad', scans: 76, clicks: 58, category: 'salads' },
    { itemName: 'Iced Latte', scans: 65, clicks: 52, category: 'drinks' },
    { itemName: 'Chocolate Lava Cake', scans: 54, clicks: 43, category: 'desserts' },
  ],
  totalScans: 1247,
  totalOrders: 456,
  avgOrderValue: 32.50,
  avgOrderPrepTime: 18.5, // minutes
  peakHours: generateHourlyData(),
  trendData: generateTrendData(),
  categoryAnalytics: [
    { category: 'breakfast', totalScans: 234, totalClicks: 156, totalOrders: 89, avgOrderValue: 12.50 },
    { category: 'mains', totalScans: 312, totalClicks: 233, totalOrders: 156, avgOrderValue: 24.75 },
    { category: 'drinks', totalScans: 207, totalClicks: 173, totalOrders: 98, avgOrderValue: 5.25 },
    { category: 'salads', totalScans: 76, totalClicks: 58, totalOrders: 34, avgOrderValue: 13.50 },
    { category: 'desserts', totalScans: 108, totalClicks: 86, totalOrders: 45, avgOrderValue: 9.00 },
  ],
  insights: [
    {
      type: 'high_demand',
      title: 'Peak Hours Identified',
      message: 'Lunch (11am-2pm) and Dinner (6pm-9pm) show highest order volumes. Consider staffing accordingly.',
      priority: 'high',
    },
    {
      type: 'trending_item',
      title: 'Avocado Toast Trending Up',
      message: 'Avocado Toast has seen a 25% increase in scans over the past week. Consider promoting it.',
      priority: 'medium',
    },
    {
      type: 'low_performance',
      title: 'Desserts Underperforming',
      message: 'Dessert category has lower conversion rates. Consider bundle deals or menu placement adjustments.',
      priority: 'medium',
    },
    {
      type: 'prep_time',
      title: 'Prep Time Optimization',
      message: 'Average prep time is 18.5 minutes. Ready orders are taking longer than expected - review kitchen workflow.',
      priority: 'high',
    },
  ],
}

// Generate test orders with time tracking
const now = new Date()
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const fiftyMinutesAgo = new Date(now.getTime() - 50 * 60 * 1000)
const fortyMinutesAgo = new Date(now.getTime() - 40 * 60 * 1000)
const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000)
const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000)
const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000)

export const testOrders = [
  {
    orderId: 'order-001',
    tableNumber: '5',
    items: [
      { name: 'Avocado Toast', quantity: 2, price: 12.50 },
      { name: 'Cappuccino', quantity: 2, price: 4.50 },
    ],
    totalAmount: 34.00,
    status: 'pending',
    createdAt: fiveMinutesAgo.toISOString(),
    updatedAt: fiveMinutesAgo.toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: fiveMinutesAgo.toISOString() }
    ]
  },
  {
    orderId: 'order-002',
    tableNumber: '12',
    items: [
      { name: 'Grilled Salmon', quantity: 1, price: 24.00 },
      { name: 'Caesar Salad', quantity: 1, price: 14.00 },
      { name: 'Iced Tea', quantity: 2, price: 3.50 },
    ],
    totalAmount: 45.00,
    status: 'preparing',
    createdAt: fifteenMinutesAgo.toISOString(),
    updatedAt: tenMinutesAgo.toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: fifteenMinutesAgo.toISOString() },
      { status: 'preparing', timestamp: tenMinutesAgo.toISOString() }
    ]
  },
  {
    orderId: 'order-003',
    tableNumber: '8',
    items: [
      { name: 'Beef Burger', quantity: 2, price: 18.00 },
      { name: 'French Fries', quantity: 2, price: 6.00 },
      { name: 'Coca Cola', quantity: 2, price: 3.00 },
    ],
    totalAmount: 54.00,
    status: 'ready',
    createdAt: thirtyMinutesAgo.toISOString(),
    updatedAt: fiveMinutesAgo.toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: thirtyMinutesAgo.toISOString() },
      { status: 'preparing', timestamp: twentyMinutesAgo.toISOString() },
      { status: 'ready', timestamp: fiveMinutesAgo.toISOString() }
    ]
  },
  {
    orderId: 'order-004',
    tableNumber: '3',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 16.00 },
      { name: 'Garlic Bread', quantity: 1, price: 8.00 },
      { name: 'Red Wine', quantity: 1, price: 12.00 },
    ],
    totalAmount: 36.00,
    status: 'served',
    createdAt: oneHourAgo.toISOString(),
    updatedAt: thirtyMinutesAgo.toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: oneHourAgo.toISOString() },
      { status: 'preparing', timestamp: fiftyMinutesAgo.toISOString() },
      { status: 'ready', timestamp: fortyMinutesAgo.toISOString() },
      { status: 'served', timestamp: thirtyMinutesAgo.toISOString() }
    ]
  },
  {
    orderId: 'order-005',
    tableNumber: '15',
    items: [
      { name: 'Fish & Chips', quantity: 1, price: 20.00 },
      { name: 'Coleslaw', quantity: 1, price: 5.00 },
    ],
    totalAmount: 25.00,
    status: 'preparing',
    createdAt: twoMinutesAgo.toISOString(),
    updatedAt: oneMinuteAgo.toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: twoMinutesAgo.toISOString() },
      { status: 'preparing', timestamp: oneMinuteAgo.toISOString() }
    ]
  },
]

