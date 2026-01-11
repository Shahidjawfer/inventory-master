import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Button } from './ui/button'

function isLowStock(quantity, minStock) {
  return quantity < minStock
}

function formatDateDMY(value) {
  if (!value) return '-'
  // Try standard Date parsing first
  const d = new Date(value)
  if (!isNaN(d)) {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }

  // Fallback: try common delimited formats (YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY)
  const parts = String(value).split(/[T\s]/)[0].split(/[-\/]/)
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const [y, m, d2] = parts
      return `${String(d2).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`
    } else {
      const [p1, p2, p3] = parts
      // If first part > 12, assume DD/MM/YYYY
      if (Number(p1) > 12) {
        return `${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}-${String(p3)}`
      }
      // Otherwise assume MM/DD/YYYY
      return `${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}-${String(p3)}`
    }
  }

  return value
}

function DataTable({ tableName, onEdit, supabase, refreshKey, filters = {} }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [tableName, supabase, refreshKey, JSON.stringify(filters)])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      //creating a query variable to build the filter dynamically
      let tableData = []
      let tableError = null

      if (tableName === 'products') {
        let query = supabase.from('products').select('*')

        // apply server-side filters where possible
        if (filters.category) query = query.eq('category', filters.category)
        if (filters.supplierId) query = query.eq('supplier_id', Number(filters.supplierId))
        if (filters.minPrice) query = query.gte('price', Number(filters.minPrice))
        if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice))
        if (filters.q) {
          const q = filters.q.replace(/%/g, '')
          query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
        }

        const res = await query
        tableData = res.data
        tableError = res.error

        // client-side filter for stockStatus
        if (!tableError && tableData && filters.stockStatus && filters.stockStatus !== 'all') {
          if (filters.stockStatus === 'low') {
            tableData = tableData.filter(p => Number(p.quantity) < Number(p.min_stock_level))
          } else if (filters.stockStatus === 'ok') {
            tableData = tableData.filter(p => Number(p.quantity) >= Number(p.min_stock_level))
          }
        }
      } else {
        const res = await supabase.from(tableName).select('*')
        tableData = res.data
        tableError = res.error
      }

      if (tableError) {
        setError(tableError.message)
      } else {
        setData(tableData || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (deleteError) {
        alert(`Error deleting record: ${deleteError.message}`)
      } else {
        loadData()
      }
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }

  const renderTableContent = () => {
    if (tableName === 'products') {
      return (
        <>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Supplier ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const lowStock = isLowStock(product.quantity, product.min_stock_level)
              return (
                <TableRow
                  key={product.id}
                  className={`animate-in fade-in slide-in-from-bottom-4 ${lowStock ? 'bg-red-50 hover:bg-red-100/50' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{product.quantity}</span>
                      {lowStock && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          Low Stock
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.supplier_id}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>{product.min_stock_level || '-'}</TableCell>
                  <TableCell>
                    {product.created_at ? formatDateDMY(product.created_at) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </>
      )
    } else if (tableName === 'suppliers') {
      return (
        <>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((supplier, index) => (
              <TableRow
                key={supplier.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>{supplier.id}</TableCell>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.address || '-'}</TableCell>
                <TableCell>{supplier.contact_person || '-'}</TableCell>
                <TableCell>{supplier.contact_number || '-'}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>
                  {supplier.created_at ? formatDateDMY(supplier.created_at) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(supplier.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </>
      )
    } else if (tableName === 'transactions') {
      return (
        <>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Quantity Sold</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((tx, index) => (
              <TableRow
                key={tx.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>{tx.id}</TableCell>
                <TableCell>{tx.product_id}</TableCell>
                <TableCell>{tx.quantity_sold}</TableCell>
                <TableCell>
                  {tx.date ? formatDateDMY(tx.date) : '-'}
                </TableCell>
                <TableCell className="font-medium">${tx.total}</TableCell>
                <TableCell>{tx.user_id}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(tx)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tx.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </>
      )
    } else if (tableName === 'users') {
      return (
        <>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => (
              <TableRow
                key={user.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    {user.role || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  {user.created_at ? formatDateDMY(user.created_at) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </>
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-sm border"
    >
      <Table>{renderTableContent()}</Table>
    </motion.div>
  )
}

export default DataTable
