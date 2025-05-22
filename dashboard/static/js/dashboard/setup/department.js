// Utility function to get CSRF token
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

// API endpoints
const API = {
    departments: '/api/departments/',
    department: (id) => `/api/departments/${id}/`
};

// Current page and items per page
let currentPage = 1;
const itemsPerPage = 10;

// Function to load departments
async function loadDepartments(page = 1) {
    try {
        currentPage = page;
        const response = await fetch(`${API.departments}?page=${page}&per_page=${itemsPerPage}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received departments:', data);

        // Update table
        updateDepartmentTable(data.departments);
        
        // Update pagination
        updatePagination(data.total_pages, data.current_page);
    } catch (error) {
        console.error('Error loading departments:', error);
        showAlert('error', 'Failed to load departments. Please try again.');
    }
}

// Function to update department table
function updateDepartmentTable(departments) {
    const tbody = document.getElementById('department-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    departments.forEach(dept => {
        const row = document.createElement('tr');
        
        // Create cells
        const cells = [
            dept.department_id,
            dept.name,
            createActionButtons(dept)
        ];
        
        // Create row with cells
        row.innerHTML = cells.map(cell => `<td>${cell}</td>`).join('');
        
        tbody.appendChild(row);
    });
}

// Function to create action buttons
function createActionButtons(dept) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'btn-group';
    
    // View button (always visible if user has view permission)
    if (dept.can_view) {
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-info me-1';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.title = 'View Department';
        viewBtn.setAttribute('data-bs-toggle', 'modal');
        viewBtn.setAttribute('data-bs-target', '#viewDepartmentModal');
        viewBtn.setAttribute('data-dept-id', dept.id);
        viewBtn.setAttribute('data-dept-code', dept.department_id);
        viewBtn.setAttribute('data-dept-name', dept.name);
        viewBtn.setAttribute('data-dept-created', dept.created_at);
        viewBtn.setAttribute('data-dept-updated', dept.updated_at);
        actionsDiv.appendChild(viewBtn);
    }
    
    // Edit button (only visible if user has update permission)
    if (dept.can_update) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary me-1';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Department';
        editBtn.setAttribute('data-bs-toggle', 'modal');
        editBtn.setAttribute('data-bs-target', '#editDepartmentModal');
        editBtn.setAttribute('data-dept-id', dept.id);
        editBtn.setAttribute('data-dept-code', dept.department_id);
        editBtn.setAttribute('data-dept-name', dept.name);
        actionsDiv.appendChild(editBtn);
    }
    
    // Delete button (only visible if user has delete permission)
    if (dept.can_delete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Department';
        deleteBtn.setAttribute('data-bs-toggle', 'modal');
        deleteBtn.setAttribute('data-bs-target', '#deleteConfirmModal');
        deleteBtn.setAttribute('data-dept-id', dept.id);
        deleteBtn.setAttribute('data-dept-name', dept.name);
        actionsDiv.appendChild(deleteBtn);
    }
    
    return actionsDiv.outerHTML;
}

// Function to save new department
async function saveDepartment(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const departmentId = document.getElementById('department-id').value;
    const departmentName = document.getElementById('department-name').value;
    
    // Validate department ID is a number
    if (!/^\d+$/.test(departmentId)) {
        showAlert('error', 'Department ID must be a number');
        return;
    }
    
    try {
        console.log('Saving department:', { department_id: departmentId, name: departmentName });
        const response = await fetch(API.departments, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                department_id: departmentId,
                name: departmentName
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.detail || errorData.error || 'Failed to save department');
        }
        
        // Clear form and reload departments
        form.reset();
        form.classList.remove('was-validated');
        loadDepartments(currentPage);
        showAlert('success', 'Department saved successfully');
    } catch (error) {
        console.error('Error:', error);
        showAlert('error', error.message || 'Failed to save department');
    }
}

// Function to save edited department
async function saveEditedDepartment() {
    console.log('Starting department update process...');
    
    const form = document.getElementById('edit-department-form');
    if (!form.checkValidity()) {
        console.log('Form validation failed');
        form.classList.add('was-validated');
        return;
    }

    const deptId = document.getElementById('edit-department-id').value;
    const departmentName = document.getElementById('edit-department-name').value;

    console.log('Update data:', {
        deptId,
        departmentName
    });

    try {
        console.log('Making API request to:', API.department(deptId));
        const response = await fetch(API.department(deptId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                department_id: deptId,
                name: departmentName
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const data = await response.json();
            console.error('Error response data:', data);
            throw new Error(data.detail || data.error || `Failed to update department: ${response.status}`);
        }

        // Close modal and reload departments
        const modal = bootstrap.Modal.getInstance(document.getElementById('editDepartmentModal'));
        modal.hide();
        loadDepartments(currentPage);
        showAlert('success', 'Department updated successfully');
    } catch (error) {
        console.error('Error in saveEditedDepartment:', error);
        showAlert('error', error.message || 'Failed to update department');
    }
}

// Function to update pagination
function updatePagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `;
    
    pagination.innerHTML = html;
    
    // Add click event listeners
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage) {
                loadDepartments(page);
            }
        });
    });
}

// Function to show alert messages
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadDepartments();

    // Add event listeners
    const departmentForm = document.getElementById('department-form');
    if (departmentForm) {
        departmentForm.addEventListener('submit', saveDepartment);
    }

    // Connect save edit button
    const saveEditBtn = document.getElementById('save-edit-btn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedDepartment);
    }
    
    // Add input validation for numeric IDs
    const deptIdInput = document.getElementById('department-id');
    const editDeptIdInput = document.getElementById('edit-department-id-input');
    
    if (deptIdInput) {
        deptIdInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
    
    if (editDeptIdInput) {
        editDeptIdInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadDepartments(1);
            }, 500);
        });
    }

    // Modal event listeners
    const editDepartmentModal = document.getElementById('editDepartmentModal');
    if (editDepartmentModal) {
        editDepartmentModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const deptId = button.getAttribute('data-dept-id');
            const deptName = button.getAttribute('data-dept-name');

            console.log('Edit modal opened with data:', { deptId, deptName });

            // Set the values in the form
            document.getElementById('edit-department-id').value = deptId;
            document.getElementById('edit-department-name').value = deptName;

            // Reset validation state
            const form = document.getElementById('edit-department-form');
            form.classList.remove('was-validated');
        });
    }

    const viewDepartmentModal = document.getElementById('viewDepartmentModal');
    if (viewDepartmentModal) {
        viewDepartmentModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const deptCode = button.getAttribute('data-dept-code');
            const deptName = button.getAttribute('data-dept-name');
            const deptCreated = button.getAttribute('data-dept-created');
            const deptUpdated = button.getAttribute('data-dept-updated');

            // Format dates if they exist
            const createdDate = deptCreated ? new Date(deptCreated).toLocaleString() : 'N/A';
            const updatedDate = deptUpdated ? new Date(deptUpdated).toLocaleString() : 'N/A';

            document.getElementById('view-department-id').textContent = deptCode || 'N/A';
            document.getElementById('view-department-name').textContent = deptName || 'N/A';
            document.getElementById('view-department-created').textContent = createdDate;
            document.getElementById('view-department-updated').textContent = updatedDate;
        });
    }

    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const deptId = button.getAttribute('data-dept-id');
            const deptName = button.getAttribute('data-dept-name');

            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.onclick = async () => {
                try {
                    const response = await fetch(API.department(deptId), {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });
                    
                    if (response.ok) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                        modal.hide();
                        loadDepartments(currentPage);
                        showAlert('success', 'Department deleted successfully');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete department');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('error', error.message || 'Failed to delete department');
                }
            };
        });
    }

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const form = document.getElementById('department-form');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
        });
    }
}); 