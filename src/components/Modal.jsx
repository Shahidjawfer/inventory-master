import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

function Modal({ mode, tableName, record, onClose, supabase, onSuccess, open }) {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (record) {
      setFormData(record)
    } else {
      // Initialize empty form data- no need ID for auto-generations
      const initialData = {}
      // Only products table requires manual ID
      if (tableName === 'products') {
        // Products needs manual ID, but we'll let user enter it
        initialData.id = ''
      }
      // For suppliers, users, and transactions, don't include id (auto-increment)
      setFormData(initialData)
    }
  }, [record, open, tableName])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (mode === 'add') {
        let dataToInsert = { ...formData }
        
        if (tableName === 'products') {
          // Products require manual ID - validate if its provided
          if (!dataToInsert.id) {
            alert('Product ID is required')
            setLoading(false)
            return
          }
        } else if (tableName === 'transactions') {
          // Transactions have optional ID (auto-generated via database trigger or defaults)
          // Only include id if it has a value; omit it for auto-generation
          if (dataToInsert.id === '' || dataToInsert.id === null || dataToInsert.id === undefined) {
            delete dataToInsert.id
          }
        } else if (tableName === 'suppliers' || tableName === 'users') {
          // These tables have auto-increment IDs - remove from insert
          delete dataToInsert.id
        }
        
        const { error } = await supabase
          .from(tableName)
          .insert([dataToInsert])
        
        if (error) {
          alert(`Error adding record: ${error.message}`)
          setLoading(false)
          return
        }

        // If transaction was added successfully, update the product quantity
        if (tableName === 'transactions') {
          const productId = dataToInsert.product_id
          const quantitySold = dataToInsert.quantity_sold

          // Fetch current product quantity
          const { data: productData, error: fetchError } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', productId)
            .single()

          if (fetchError) {
            alert(`Error fetching product: ${fetchError.message}`)
            setLoading(false)
            return
          }

          const newQuantity = productData.quantity - quantitySold

          // Update product quantity
          const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', productId)

          if (updateError) {
            alert(`Error updating product quantity: ${updateError.message}`)
            setLoading(false)
            return
          }
        }
      } else {
        // For updates, prepare data without the id field
        const { id, ...updateData } = formData
        
        // If updating a transaction, also update product quantity
        if (tableName === 'transactions' && record) {
          const oldQuantity = record.quantity_sold
          const newQuantity = updateData.quantity_sold
          const quantityDifference = newQuantity - oldQuantity

          if (quantityDifference !== 0) {
            // Fetch current product quantity
            const { data: productData, error: fetchError } = await supabase
              .from('products')
              .select('quantity')
              .eq('id', updateData.product_id || record.product_id)
              .single()

            if (fetchError) {
              alert(`Error fetching product: ${fetchError.message}`)
              setLoading(false)
              return
            }

            const updatedProductQuantity = productData.quantity - quantityDifference

            // Update product quantity
            const { error: prodUpdateError } = await supabase
              .from('products')
              .update({ quantity: updatedProductQuantity })
              .eq('id', updateData.product_id || record.product_id)

            if (prodUpdateError) {
              alert(`Error updating product quantity: ${prodUpdateError.message}`)
              setLoading(false)
              return
            }
          }
        }

        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', record.id)
        
        if (error) {
          alert(`Error updating record: ${error.message}`)
          setLoading(false)
          return
        }
      }
      
      onSuccess()
      setLoading(false)
    } catch (err) {
      alert(`Error: ${err.message}`)
      setLoading(false)
    }
  }

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const renderFields = () => {
    if (tableName === 'products') {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="id">ID {mode === 'add' && <span className="text-red-500">*</span>}</Label>
            <Input
              id="id"
              type="number"
              name="id"
              placeholder={mode === 'add' ? 'Enter unique product ID' : ''}
              value={formData.id || ''}
              onChange={handleChange}
              required={mode === 'add'}
              disabled={mode === 'edit'}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              type="text"
              name="sku"
              value={formData.sku || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="supplier_id">Supplier ID</Label>
            <Input
              id="supplier_id"
              type="number"
              name="supplier_id"
              value={formData.supplier_id || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              type="text"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="min_stock_level">Min Stock Level</Label>
            <Input
              id="min_stock_level"
              type="number"
              name="min_stock_level"
              value={formData.min_stock_level || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="created_at">Created At</Label>
            <Input
              id="created_at"
              type="date"
              name="created_at"
              value={formData.created_at ? formData.created_at.split('T')[0] : ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      )
    } else if (tableName === 'transactions') {
      return (
        <div className="grid gap-4 py-4">
          {mode === 'add' && (
            <div className="grid gap-2">
              <Label htmlFor="id">ID (Optional - auto-generated if empty)</Label>
              <Input
                id="id"
                type="text"
                name="id"
                value={formData.id || ''}
                onChange={handleChange}
                placeholder="Leave empty for auto-generation"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="product_id">Product ID <span className="text-red-500">*</span></Label>
            <Input
              id="product_id"
              type="number"
              name="product_id"
              value={formData.product_id || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity_sold">Quantity Sold <span className="text-red-500">*</span></Label>
            <Input
              id="quantity_sold"
              type="number"
              name="quantity_sold"
              value={formData.quantity_sold || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              name="date"
              value={formData.date ? formData.date.split('T')[0] : ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="total">Total <span className="text-red-500">*</span></Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              name="total"
              value={formData.total || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user_id">User ID <span className="text-red-500">*</span></Label>
            <Input
              id="user_id"
              type="number"
              name="user_id"
              value={formData.user_id || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      )
    } else if (tableName === 'suppliers') {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                type="text"
                name="contact_person"
                value={formData.contact_person || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                type="text"
                name="contact_number"
                value={formData.contact_number || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      )
    } else if (tableName === 'users') {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              name="username"
              value={formData.username || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add ' : 'Edit '}
            {capitalize(tableName.slice(0, -1))}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? `Add a new ${tableName.slice(0, -1)} to the system.`
              : `Update the ${tableName.slice(0, -1)} information.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {renderFields()}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Modal
