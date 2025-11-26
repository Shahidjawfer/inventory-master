//products Table
async function renderProductsTable() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
    alert('Error loading products');
    return;
    }
    let tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(product => {
    let row = document.createElement('tr');
    row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.sku}</td>
        <td>${product.quantity}</td>
        <td>${product.price}</td>
        <td>${product.supplier_id}</td>
        <td>${product.category || ''}</td>
        <td>${product.min_stock_level || ''}</td>
        <td>${product.created_at ? new Date(product.created_at).toLocaleDateString() : ''}</td>
    `;
    tbody.appendChild(row);
    });
}

//Suppliers Table
async function renderSuppliersTable() {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) {
    alert('Error loading suppliers');
    return;
    }
    let tbody = document.getElementById('suppliers-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(supplier => {
    let row = document.createElement('tr');
    row.innerHTML = `
        <td>${supplier.id}</td>
        <td>${supplier.name}</td>
        <td>${supplier.address}</td>
        <td>${supplier.contact_person}</td>
        <td>${supplier.contact_number}</td>
        <td>${supplier.email}</td>
        <td>${supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : ''}</td>
    `;
    tbody.appendChild(row);
    });
}

//Transactions Table
async function renderTransactionsTable() {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) {
    alert('Error loading transactions');
    return;
    }
    let tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(tx => {
    let row = document.createElement('tr');
    row.innerHTML = `
        <td>${tx.id}</td>
        <td>${tx.product_id}</td>
        <td>${tx.quantity_sold}</td>
        <td>${tx.date ? new Date(tx.date).toLocaleDateString() : ''}</td>
        <td>${tx.total}</td>
        <td>${tx.user_id}</td>
    `;
    tbody.appendChild(row);
    });
}

//Users Table
async function renderUsersTable() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        alert('Error loading users');
    return;
    }
    let tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(user => {
    let row = document.createElement('tr');
    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${user.password}</td>
        <td>${user.role}</td>
        <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
    `;
    tbody.appendChild(row);
    });
}



