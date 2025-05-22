// API endpoints
const API = {
    users: '/api/users/',
    user: (id) => `/api/users/${id}/`
};

// Function to format date
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Function to create action buttons
function createActionButtons(user) {
    console.log('Creating action buttons for user:', user); // Debug log
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'btn-group';
    
    // Get current user permissions from the page
    const currentUserPermissions = window.currentUserPermissions || {};
    console.log('Current user permissions:', currentUserPermissions); // Debug log
    
    // Only create buttons if user has necessary permissions
    if (currentUserPermissions.can_update_users || currentUserPermissions.can_delete_users) {
        // Check if current user has update permission
        if (currentUserPermissions.can_update_users) {
            console.log('Current user has update permission'); // Debug log
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-primary me-2';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit User';
            editBtn.onclick = () => editUser(user);
            actionsDiv.appendChild(editBtn);
        }
        
        // Check if current user has delete permission
        if (currentUserPermissions.can_delete_users) {
            console.log('Current user has delete permission'); // Debug log
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete User';
            deleteBtn.onclick = () => deleteUser(user.id);
            actionsDiv.appendChild(deleteBtn);
        }
    }
    
    return actionsDiv;
}

// Function to load users
async function loadUsers() {
    try {
        console.log('Fetching users from:', API.users);
        const response = await fetch(API.users, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received users:', data);
        
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) {
            console.error('Table body element not found');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (!Array.isArray(data)) {
            console.error('Received data is not an array:', data);
            return;
        }
        
        data.forEach(user => {
            console.log('Processing user:', user); // Debug log
            const row = document.createElement('tr');
            
            // Create basic user info cells
            const cells = [
                user.username || '',
                user.email || '',
                `${user.first_name || ''} ${user.last_name || ''}`,
                `<span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">${user.status === 'active' ? 'Active' : 'Inactive'}</span>`,
                formatDate(user.last_login)
            ];
            
            // Add action buttons if user has permissions
            if (window.currentUserPermissions.can_update_users || window.currentUserPermissions.can_delete_users) {
                cells.push(''); // Empty cell for actions
            }
            
            // Create row with cells
            row.innerHTML = cells.map(cell => `<td>${cell}</td>`).join('');
            
            // Add action buttons if needed
            if (window.currentUserPermissions.can_update_users || window.currentUserPermissions.can_delete_users) {
                const actionsCell = row.querySelector('td:last-child');
                const actionButtons = createActionButtons(user);
                actionsCell.appendChild(actionButtons);
            }
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('error', 'Failed to load users. Please try again.');
    }
}

// Function to edit user
function editUser(user) {
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    document.getElementById('userModalLabel').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('firstName').value = user.first_name;
    document.getElementById('lastName').value = user.last_name;
    document.getElementById('status').value = user.status;
    document.getElementById('password').value = '';
    modal.show();
}

// Function to delete user
function deleteUser(userId) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    document.getElementById('confirmDelete').onclick = async () => {
        try {
            const response = await fetch(API.user(userId), {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            
            if (response.ok) {
                modal.hide();
                loadUsers();
                showAlert('success', 'User deleted successfully');
            } else {
                console.error('Error deleting user:', response.statusText);
                showAlert('error', 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', 'An error occurred while deleting the user');
        }
    };
    modal.show();
}

// Function to create user
async function createUser(userData) {
    try {
        const response = await fetch(API.users, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Function to save user
async function saveUser() {
    try {
        const userId = document.getElementById('userId').value;
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            status: document.getElementById('status').value
        };
        
        const password = document.getElementById('password').value;
        if (password) {
            userData.password = password;
        }

        if (userId) {
            // Update existing user
            await updateUser(userId, userData);
        } else {
            // Create new user
            await createUser(userData);
        }

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
        modal.hide();
        loadUsers();

        // Show success message
        showAlert('success', userId ? 'User updated successfully!' : 'User created successfully!');
    } catch (error) {
        console.error('Error saving user:', error);
        showAlert('error', error.message || 'Failed to save user');
    }
}

// Add event listener for save button
document.addEventListener('DOMContentLoaded', function() {
    const saveUserBtn = document.getElementById('saveUser');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', saveUser);
    }

    // Add User button click handler
    const addUserBtn = document.querySelector('[data-bs-target="#userModal"]');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            const modal = document.getElementById('userModal');
            modal.querySelector('#userModalLabel').textContent = 'Add User';
            modal.querySelector('#userForm').reset();
            modal.querySelector('#userId').value = '';
            modal.querySelector('#password').required = true;
        });
    }

    // Delete confirmation handler
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            deleteUser(userId);
        });
    }
});

// Function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
} 