import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell } from 'lucide-react'
import userAvatar from '../imgs/useravatar.png'
import { Input } from './ui/input'
import { Button } from './ui/button'

function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')

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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-primary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <motion.img
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          src={userAvatar}
          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-primary"
          alt="User"
        />
      </div>
    </motion.div>
  )
}

export default TopBar
