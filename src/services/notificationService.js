import { supabase } from '../supabaseClient'

export const notificationService = {
  // Get low stock products
  async getLowStockProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, quantity, min_stock_level, sku')
        .lt('quantity', supabase.rpc('min_stock_level'))

      if (error) {
        // Fallback: fetch all products and filter client-side
        const { data: allProducts, error: fetchError } = await supabase
          .from('products')
          .select('id, name, quantity, min_stock_level, sku')

        if (fetchError) throw fetchError

        const lowStockProducts = allProducts.filter(
          product => product.quantity < product.min_stock_level
        )
        return { products: lowStockProducts, error: null }
      }

      return { products: data || [], error: null }
    } catch (error) {
      return { products: [], error: error.message }
    }
  },

  // Get recent transactions
  async getRecentTransactions(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          product_id,
          quantity_sold,
          date,
          total,
          user_id,
          products:product_id(name, sku)
        `)
        .order('date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { transactions: data || [], error: null }
    } catch (error) {
      return { transactions: [], error: error.message }
    }
  },

  // Get all notifications (low stock + recent transactions)
  async getAllNotifications() {
    const { products: lowStockProducts } = await this.getLowStockProducts()
    const { transactions: recentTransactions } = await this.getRecentTransactions()

    const notifications = [
      ...lowStockProducts.map(product => ({
        id: `low-stock-${product.id}`,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} is below minimum level (${product.quantity}/${product.min_stock_level})`,
        severity: 'warning',
        product: product,
        timestamp: new Date()
      })),
      ...recentTransactions.map(tx => ({
        id: `transaction-${tx.id}`,
        type: 'transaction',
        title: 'New Transaction',
        message: `${tx.products?.name || 'Product'} - ${tx.quantity_sold} units sold for $${tx.total}`,
        severity: 'info',
        transaction: tx,
        timestamp: new Date(tx.date)
      }))
    ]

    return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  },

  // Subscribe to real-time product changes (for low stock updates)
  subscribeToProductChanges(callback) {
    return supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  },

  // Subscribe to real-time transaction changes
  subscribeToTransactionChanges(callback) {
    return supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }
}
