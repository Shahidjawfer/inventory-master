let currentTable = document.getElementById('table-select').value; 
document.getElementById('table-select').addEventListener('change', function() {currentTable = this.value;})

function openModal(mode='add', record=null) {
    document.getElementById('modal-title').innerText = (mode === 'add' ? 'Add ' : 'Edit ') + capitalize(currentTable.slice(0, -1));
    document.getElementById('modal-backdrop').style.display = 'block';
    document.getElementById('modal-dialog').style.display = 'block';
    renderModalFields(mode, record);
}

function closeModal() {
    document.getElementById('modal-backdrop').style.display = 'none';
    document.getElementById('modal-dialog').style.display = 'none';
    document.getElementById('modal-form').reset();
}

function renderModalFields(mode, record) {
    const fieldsDiv = document.getElementById('modal-fields');
    let html = '';
    if (currentTable === 'products') {
        html += '<label>id</label><input type="number" name="id" value="' + (record ? record.id : '') + '" required>';
        html += '<label>name</label><input type="text" name="name" value="' + (record ? record.name : '') + '" required>';
        html += '<label>sku</label><input type="text" name="sku" value="' + (record ? record.sku : '') + '" required>';
        html += '<label>quantity</label><input type="number" name="quantity" value="' + (record ? record.quantity : '') + '" required>';
        html += '<label>price</label><input type="number" step="0.01" name="price" value="' + (record ? record.price : '') + '">';0.01
        html += '<label>supplier_ID</label><input type="number" name="supplier_id" value="' + (record ? record.supplier_id : '') + '" required>';
        html += '<label>category</label><input type="text" name="category" value="' + (record ? record.category : '') + '" required>';
        html += '<label>min_stock_level</label><input type="number" name="min_stock_level" value="' + (record ? record.min_stock_level : '') + '" required>';
        html += '<label>created_at</label><input type="date" name="created_at" value="' + (record ? record.created_at : '') + '" required>';
    }
    else if (currentTable === 'transactions') {
        html += '<label>Id</label><input type="text" name="trans_id" value="' + (record ? record.trans_id : '') + '" required>';
        html += '<label>product id</label><input type="text" name="product_id" value="' + (record ? record.product_id : '') + '" required>';
        html += '<label>quantity sold</label><input type="number" name="quantity" value="' + (record ? record.quantity : '') + '" required>';
        html += '<label>date</label><input type="date" name="date" value="' + (record ? record.date : '') + '" required>';
        html += '<label>total</label><input type="number" step="0.01" name="total" value="' + (record ? record.total : '') + '" required>';
        html += '<label>user id</label><input type="text" name="user_id" value="' + (record ? record.user_id : '') + '" required>';
    // Add more fields as needed
    }
    else if (currentTable === 'suppliers') {
        html += '<label>Name</label><input type="text" name="name" value="' + (record ? record.name : '') + '" required>';
        html += '<label>Contact</label><input type="text" name="contact" value="' + (record ? record.contact : '') + '" required>';
        html += '<label>Email</label><input type="email" name="email" value="' + (record ? record.email : '') + '" required>';
    // Add more fields as needed
    }
    else if (currentTable === 'users') {
        html += '<label>Username</label><input type="text" name="username" value="' + (record ? record.username : '') + '" required>';
        html += '<label>Email</label><input type="email" name="email" value="' + (record ? record.email : '') + '" required>';
        html += '<label>Password</label><input type="password" name="password" value="">';
    // Add more fields as needed
    }
    fieldsDiv.innerHTML = html;
}
function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Example: This is a hook to open modal when the add button is clicked
document.querySelector('.add-btn').onclick = function() { openModal('add'); };


