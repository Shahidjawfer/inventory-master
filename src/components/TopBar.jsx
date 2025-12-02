import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, LogOut, Settings, AlertCircle, ShoppingCart, Trash2, Check } from 'lucide-react'
import userAvatar from '../imgs/useravatar.png'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useAuth } from '../contexts/AuthContext'
import { notificationService } from '../services/notificationService'

function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [userData, setUserData] = useState(null)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Get user full name from auth user email or metadata
  useEffect(() => {
    if (user) {
      setUserData({
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      })
    }
  }, [user])

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
    
    // Set up real-time listeners
    const productSubscription = notificationService.subscribeToProductChanges(() => {
      loadNotifications()
    })

    const transactionSubscription = notificationService.subscribeToTransactionChanges(() => {
      loadNotifications()
    })

    return () => {
      productSubscription?.unsubscribe()
      transactionSubscription?.unsubscribe()
    }
  }, [])

  const loadNotifications = async () => {
    setNotificationLoading(true)
    const allNotifications = await notificationService.getAllNotifications()
    setNotifications(allNotifications)
    setNotificationLoading(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu, showNotifications])

  const handleLogout = async () => {
    const { error } = await logout()
    if (!error) {
      navigate('/login')
    }
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationsRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5 text-primary" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-4 border-b border-gray-100 sticky top-0 bg-white">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    {notifications.length} new {notifications.length === 1 ? 'notification' : 'notifications'}
                  </p>
                </div>

                {notificationLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border ${
                          notification.type === 'low_stock'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                        } hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {notification.type === 'low_stock' ? (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${
                              notification.type === 'low_stock'
                                ? 'text-red-900'
                                : 'text-blue-900'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 break-words">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setNotifications(notifications.filter(n => n.id !== notification.id))
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => setNotifications([])}
                      className="flex-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => loadNotifications()}
                      className="flex-1 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded transition-colors font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative cursor-pointer group"
          >
            <img
              src={userAvatar}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
              alt="User"
            />
            {/* Hover tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-40">
              <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
                {userData?.fullName || 'User'}
              </div>
            </div>
          </motion.div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{userData?.fullName || 'User'}</p>
                  <p className="text-gray-500 text-xs mt-1">{userData?.email || 'user@example.com'}</p>
                </div>
                
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/settings')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default TopBar
