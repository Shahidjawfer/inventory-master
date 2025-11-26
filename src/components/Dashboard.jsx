import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import DataTable from './DataTable'
import Modal from './Modal'
import { useSupabase } from '../contexts/SupabaseContext'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'

function Dashboard() {
  const [selectedTable, setSelectedTable] = useState('products')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = useSupabase()

  const openModal = (mode = 'add', record = null) => {
    setModalMode(mode)
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRecord(null)
  }

  const handleModalSuccess = () => {
    closeModal()
    setRefreshKey(prev => prev + 1)
  }

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar selectedTable={selectedTable} onTableChange={setSelectedTable} />
      
      <div className="flex-1 ml-64 p-8">
        <TopBar />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {capitalize(selectedTable)}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your {selectedTable} inventory
            </p>
          </div>
          <Button
            onClick={() => openModal('add')}
            className="gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Add {capitalize(selectedTable.slice(0, -1))}
          </Button>
        </motion.div>

        <motion.div
          key={selectedTable}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DataTable
            tableName={selectedTable}
            onEdit={(record) => openModal('edit', record)}
            supabase={supabase}
            refreshKey={refreshKey}
          />
        </motion.div>

        <Modal
          mode={modalMode}
          tableName={selectedTable}
          record={selectedRecord}
          onClose={closeModal}
          supabase={supabase}
          onSuccess={handleModalSuccess}
          open={isModalOpen}
        />
      </div>
    </div>
  )
}

export default Dashboard
