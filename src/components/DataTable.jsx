import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Button } from './ui/button'

function DataTable({ tableName, onEdit, supabase, refreshKey }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [tableName, supabase, refreshKey])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')

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
            {data.map((product, index) => (
              <TableRow
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>{product.id}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.supplier_id}</TableCell>
                <TableCell>{product.category || '-'}</TableCell>
                <TableCell>{product.min_stock_level || '-'}</TableCell>
                <TableCell>
                  {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
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
            ))}
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
                  {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : '-'}
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
                  {tx.date ? new Date(tx.date).toLocaleDateString() : '-'}
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
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
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
