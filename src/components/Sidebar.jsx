import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../imgs/logo.png'
import { Home, BarChart3, FileText, Settings } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { cn } from '@/lib/utils'

function Sidebar({ selectedTable, onTableChange }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/reports/transactions', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6"
      >
        <Link to="/dashboard">
          <img src={logo} className="w-40 mx-auto" alt="InventoryMaster logo" />
        </Link>
      </motion.div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <label className="text-sm font-medium text-gray-700">Select table</label>
          </div>
          <Select value={selectedTable} onValueChange={onTableChange}>
            <SelectTrigger className="w-full ml-4 bg-primary text-primary-foreground border-primary hover:bg-primary/90">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="suppliers">Suppliers</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </nav>
    </motion.div>
  )
}

export default Sidebar
