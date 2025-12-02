import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import DataTable from './DataTable'
import Modal from './Modal'
import { useSupabase } from '../contexts/SupabaseContext'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Select } from './ui/select'

function Dashboard() {
  const [selectedTable, setSelectedTable] = useState('products')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = useSupabase()

  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    supplierId: '',
    stockStatus: 'all', //this could be either 'all', 'low', or 'ok'
    minPrice: '',
    maxPrice: '',
    q: ''
  })

  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])

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

  // Fetch filter options (categories and suppliers)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const { data: cats } = await supabase
          .from('products')
          .select('category')
          .neq('category', null)

        const uniqueCats = Array.from(new Set((cats || []).map(c => c.category))).filter(Boolean)
        setCategories(uniqueCats)

        const { data: sups } = await supabase
          .from('suppliers')
          .select('id, name')
          .order('name', { ascending: true })

        setSuppliers(sups || [])
      } catch (err) {
        console.warn('Failed to load filter options', err)
      }
    }

    loadOptions()
  }, [supabase])

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
          <div className="mb-4">
            {/* Filter bar */}
            <div className="bg-white p-3 rounded-lg shadow-sm border flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search name or SKU..."
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                className="px-3 py-2 border rounded w-64"
              />

              <select
                value={filters.category}
                onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 border rounded"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filters.supplierId}
                onChange={(e) => setFilters(f => ({ ...f, supplierId: e.target.value }))}
                className="px-3 py-2 border rounded"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={filters.stockStatus}
                onChange={(e) => setFilters(f => ({ ...f, stockStatus: e.target.value }))}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="ok">Sufficient</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                className="px-3 py-2 border rounded w-28"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="px-3 py-2 border rounded w-28"
              />

              <div className="ml-auto flex gap-2">
                <Button
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="gap-2"
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setFilters({ category: '', supplierId: '', stockStatus: 'all', minPrice: '', maxPrice: '', q: '' })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <DataTable
            tableName={selectedTable}
            onEdit={(record) => openModal('edit', record)}
            supabase={supabase}
            refreshKey={refreshKey}
            filters={filters}
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
