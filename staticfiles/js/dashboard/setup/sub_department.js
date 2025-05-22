// API endpoints
const API = {
    subDepartment: (id) => `/api/sub-departments/${id}/`,
    subDepartments: '/api/sub-departments/',
    departments: '/api/departments/'
};

// DOM Elements
const subDepartmentForm = document.getElementById('sub-department-form');
const subDepartmentTableBody = document.getElementById('sub-department-table-body');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clear-btn');
const pagination = document.getElementById('pagination');
const fieldsContainer = document.getElementById('fields-container');
const addFieldBtn = document.getElementById('add-field-btn');
const fieldTemplate = document.getElementById('field-template');
const alertBox = document.getElementById('alertBox');
const alertMessage = document.getElementById('alertMessage');

// State
let currentPage = 1;
let searchQuery = '';
let departments = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
    loadSubDepartments();
    setupEventListeners();
    setupFieldHandlers();
});

// Event Listeners
function setupEventListeners() {
    // Form submission
    if (subDepartmentForm) {
        subDepartmentForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            searchQuery = searchInput.value.trim();
            currentPage = 1;
            loadSubDepartments();
        }, 300));
    }

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', clearForm);
    }
    
    // View modal
    const viewModal = document.getElementById('viewSubDepartmentModal');
    if (viewModal) {
        viewModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const deptName = button.getAttribute('data-dept-name');
            const subDeptId = button.getAttribute('data-sub-dept-id');
            const subDeptName = button.getAttribute('data-sub-dept-name');
            const fields = JSON.parse(button.getAttribute('data-fields') || '[]');
            const created = button.getAttribute('data-sub-dept-created');
            const updated = button.getAttribute('data-sub-dept-updated');
            
            document.getElementById('view-department').textContent = deptName;
            document.getElementById('view-sub-department-id').textContent = subDeptId;
            document.getElementById('view-sub-department-name').textContent = subDeptName;
            document.getElementById('view-sub-department-created').textContent = created;
            document.getElementById('view-sub-department-updated').textContent = updated;
            
            // Display fields in view modal
            const fieldsContainer = document.getElementById('view-fields-container');
            if (fieldsContainer) {
                fieldsContainer.innerHTML = '';
                if (fields.length > 0) {
                    const fieldsList = document.createElement('ul');
                    fieldsList.className = 'list-group';
                    fields.forEach(field => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item';
                        li.innerHTML = `
                            <strong>${field.name}</strong><br>
                            Type: ${field.data_type}<br>
                            Requirement: ${field.requirement}<br>
                            Verify: ${field.verify ? 'Yes' : 'No'}
                        `;
                        fieldsList.appendChild(li);
                    });
                    fieldsContainer.appendChild(fieldsList);
                } else {
                    fieldsContainer.innerHTML = '<p class="text-muted">No fields configured</p>';
                }
            }
        });
    }
    
    // Edit modal
    const editModal = document.getElementById('editSubDepartmentModal');
    if (editModal) {
        editModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const deptId = button.getAttribute('data-dept-id');
            const subDeptId = button.getAttribute('data-sub-dept-id');
            const subDeptName = button.getAttribute('data-sub-dept-name');
            const fields = JSON.parse(button.getAttribute('data-fields') || '[]');
            
            document.getElementById('edit-sub-department-id').value = subDeptId;
            document.getElementById('edit-department').value = deptId;
            document.getElementById('edit-sub-department-name').value = subDeptName;
            
            // Clear and populate fields
            const editFieldsContainer = document.getElementById('edit-fields-container');
            if (editFieldsContainer) {
                editFieldsContainer.innerHTML = '';
                fields.forEach(field => {
                    addNewField(field, editFieldsContainer);
                });
            }
            
            const form = document.getElementById('edit-sub-department-form');
            form.classList.remove('was-validated');
        });
    }
    
    // Save edit button
    const saveEditBtn = document.getElementById('save-edit-btn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedSubDepartment);
    }
    
    // Delete confirmation modal
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const subDeptId = button.getAttribute('data-sub-dept-id');
            const subDeptName = button.getAttribute('data-sub-dept-name');

            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.onclick = async () => {
                try {
                    const response = await fetch(API.subDepartment(subDeptId), {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });
                    
                    if (response.ok) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                        modal.hide();
                        await loadSubDepartments(currentPage);
                        showAlert('success', 'Sub-department deleted successfully');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete sub-department');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('danger', error.message || 'Failed to delete sub-department');
                }
            };
        });
    }

    // Add field button
    if (addFieldBtn) {
        addFieldBtn.addEventListener('click', () => addNewField());
    }
    
    // Edit add field button
    const editAddFieldBtn = document.getElementById('edit-add-field-btn');
    if (editAddFieldBtn) {
        editAddFieldBtn.addEventListener('click', () => {
            const editFieldsContainer = document.getElementById('edit-fields-container');
            if (editFieldsContainer) {
                addNewField(null, editFieldsContainer);
            }
        });
    }
}

// Field Handlers
function setupFieldHandlers() {
    // Delegate event listener for remove field buttons
    if (fieldsContainer) {
        fieldsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-field-btn')) {
                const fieldRow = e.target.closest('.field-row');
                if (fieldRow) {
                    fieldRow.remove();
                }
            }
        });
    }
}

function addNewField(fieldData = null, container = fieldsContainer) {
    if (!fieldTemplate || !container) return;

    const fieldRow = fieldTemplate.content.cloneNode(true);
    const fieldElement = fieldRow.querySelector('.field-row');

    if (fieldData) {
        // Populate field data if editing
        fieldElement.querySelector('.field-name').value = fieldData.name || '';
        fieldElement.querySelector('.field-data-type').value = fieldData.data_type || '';
        fieldElement.querySelector('.field-requirement').value = fieldData.requirement || 'optional';
        fieldElement.querySelector('.field-verify').checked = fieldData.verify || false;
    }

    container.appendChild(fieldElement);
}

// Get Fields Data
function getFieldsData() {
    const fields = [];
    const fieldRows = fieldsContainer.querySelectorAll('.field-row');

    fieldRows.forEach(row => {
        const field = {
            name: row.querySelector('.field-name').value.trim(),
            data_type: row.querySelector('.field-data-type').value,
            requirement: row.querySelector('.field-requirement').value,
            verify: row.querySelector('.field-verify').checked
        };
        if (field.name) {  // Only add fields that have a name
            fields.push(field);
        }
    });

    return fields;
}

// Load Departments
async function loadDepartments() {
    try {
        const response = await fetch(API.departments);
        if (!response.ok) throw new Error('Failed to load departments');

        const data = await response.json();
        console.log('Raw department data:', data);
        
        // Handle paginated response format
        departments = data.departments || [];
        console.log('Processed departments:', departments);
        
        if (departments.length === 0) {
            console.warn('No departments found');
            showAlert('warning', 'No departments available');
        }
        
        populateDepartmentSelects();
    } catch (error) {
        console.error('Error loading departments:', error);
        showAlert('danger', 'Failed to load departments');
    }
}

// Populate Department Selects
function populateDepartmentSelects() {
    const selects = ['department', 'edit-department'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) {
            console.error(`Select element with id '${selectId}' not found`);
            return;
        }

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select Department</option>';
        
        if (!departments || departments.length === 0) {
            console.warn('No departments to populate in select');
            return;
        }
        
        departments.forEach(dept => {
            if (!dept.id || !dept.name) {
                console.warn('Invalid department data:', dept);
                return;
            }
            
            const option = document.createElement('option');
            option.value = dept.id;  // Use id instead of department_id
            option.textContent = `${dept.department_id} - ${dept.name}`;
            select.appendChild(option);
        });
        
        console.log(`Populated ${selectId} with ${departments.length} departments`);
    });
}

// Load Sub-Departments
async function loadSubDepartments(page = 1) {
    try {
        currentPage = page;
        const searchTerm = document.getElementById('searchInput').value;
        const url = `${API.subDepartments}?page=${page}&per_page=10${searchTerm ? `&search=${searchTerm}` : ''}`;
        
        const response = await fetch(url, {
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
        
        // Update table
        updateSubDepartmentTable(data.results || data);
        
        // Update pagination
        updatePagination(data.count || data.length, currentPage);
    } catch (error) {
        console.error('Error loading sub-departments:', error);
        showAlert('danger', 'Failed to load sub-departments. Please try again.');
    }
}

// Update Sub-Department Table
function updateSubDepartmentTable(subDepartments) {
    if (!subDepartmentTableBody) return;
    
    subDepartmentTableBody.innerHTML = '';
    
    if (!subDepartments || subDepartments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No sub-departments found</td>';
        subDepartmentTableBody.appendChild(row);
        return;
    }

    subDepartments.forEach(subDept => {
        const fieldsList = subDept.fields ? subDept.fields.map(field => field.name).join(', ') : '';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subDept.department_name}</td>
            <td>${subDept.sub_department_id}</td>
            <td>${subDept.name}</td>
            <td>${fieldsList}</td>
            <td>${createActionButtons(subDept)}</td>
        `;
        subDepartmentTableBody.appendChild(row);
    });
}

// Create Action Buttons
function createActionButtons(subDept) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'btn-group';
    
    // View button (always visible if user has view permission)
    if (subDept.can_view) {
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-info me-1';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.title = 'View Sub-Department';
        viewBtn.setAttribute('data-bs-toggle', 'modal');
        viewBtn.setAttribute('data-bs-target', '#viewSubDepartmentModal');
        viewBtn.setAttribute('data-dept-name', subDept.department_name);
        viewBtn.setAttribute('data-sub-dept-id', subDept.sub_department_id);
        viewBtn.setAttribute('data-sub-dept-name', subDept.name);
        viewBtn.setAttribute('data-fields', JSON.stringify(subDept.fields || []));
        viewBtn.setAttribute('data-sub-dept-created', subDept.created_at);
        viewBtn.setAttribute('data-sub-dept-updated', subDept.updated_at);
        actionsDiv.appendChild(viewBtn);
    }
    
    // Edit button (only visible if user has update permission)
    if (subDept.can_update) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary me-1';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Sub-Department';
        editBtn.setAttribute('data-bs-toggle', 'modal');
        editBtn.setAttribute('data-bs-target', '#editSubDepartmentModal');
        editBtn.setAttribute('data-dept-id', subDept.department);
        editBtn.setAttribute('data-sub-dept-id', subDept.sub_department_id);
        editBtn.setAttribute('data-sub-dept-name', subDept.name);
        editBtn.setAttribute('data-fields', JSON.stringify(subDept.fields || []));
        actionsDiv.appendChild(editBtn);
    }
    
    // Delete button (only visible if user has delete permission)
    if (subDept.can_delete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Sub-Department';
        deleteBtn.setAttribute('data-bs-toggle', 'modal');
        deleteBtn.setAttribute('data-bs-target', '#deleteConfirmModal');
        deleteBtn.setAttribute('data-sub-dept-id', subDept.sub_department_id);
        deleteBtn.setAttribute('data-sub-dept-name', subDept.name);
        actionsDiv.appendChild(deleteBtn);
    }
    
    return actionsDiv.outerHTML;
}

// Get Department Name
function getDepartmentName(deptId) {
    if (!deptId) return 'Unknown Department';
    
    const dept = departments.find(d => d.department_id === deptId);
    if (!dept) {
        console.warn(`Department not found for ID: ${deptId}`);
        return 'Unknown Department';
    }
    
    return `${dept.department_id} - ${dept.name}`;
}

// Handle Form Submit
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form elements
    const departmentSelect = document.getElementById('department');
    const subDeptIdInput = document.getElementById('sub-department-id');
    const subDeptNameInput = document.getElementById('sub-department-title');
    
    // Validate required fields
    if (!departmentSelect.value) {
        showAlert('error', 'Please select a department');
        return;
    }
    
    if (!subDeptIdInput.value.trim()) {
        showAlert('error', 'Please enter a sub-department ID');
        return;
    }
    
    if (!subDeptNameInput.value.trim()) {
        showAlert('error', 'Please enter a sub-department title');
        return;
    }
    
    // Get field configurations
    const fields = [];
    const fieldRows = document.querySelectorAll('.field-row');
    
    fieldRows.forEach(row => {
        const fieldNameInput = row.querySelector('.field-name');
        const dataTypeSelect = row.querySelector('.field-data-type');
        const requirementSelect = row.querySelector('.field-requirement');
        
        if (fieldNameInput && dataTypeSelect && requirementSelect) {
            const fieldName = fieldNameInput.value.trim();
            const dataType = dataTypeSelect.value;
            const requirement = requirementSelect.value;
            
            if (fieldName) {
                fields.push({
                    name: fieldName,
                    data_type: dataType,
                    requirement: requirement,
                    verify: false  // Add default verify value
                });
            }
        }
    });
    
    const data = {
        department: parseInt(departmentSelect.value),
        sub_department_id: subDeptIdInput.value.trim(),
        name: subDeptNameInput.value.trim(),
        fields: fields
    };
    
    console.log('Sending sub-department data:', data);
    
    try {
        const response = await fetch(API.subDepartments, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        console.log('Server response:', responseData);
        
        if (!response.ok) {
            if (responseData.fields) {
                throw new Error(responseData.fields.join(', '));
            }
            if (responseData.detail) {
                throw new Error(responseData.detail);
            }
            if (responseData.error) {
                throw new Error(responseData.error);
            }
            throw new Error('Failed to create sub-department');
        }
        
        showAlert('success', 'Sub-department created successfully');
        clearForm();
        await loadSubDepartments(1);
    } catch (error) {
        console.error('Error creating sub-department:', error);
        showAlert('error', error.message);
    }
}

// Save Edited Sub-Department
async function saveEditedSubDepartment() {
    const form = document.getElementById('edit-sub-department-form');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const subDeptId = document.getElementById('edit-sub-department-id').value;
    const departmentId = document.getElementById('edit-department').value;
    const subDeptName = document.getElementById('edit-sub-department-name').value;
    
    // Get fields from the edit form
    const editFieldsContainer = document.getElementById('edit-fields-container');
    const fields = [];
    if (editFieldsContainer) {
        const fieldRows = editFieldsContainer.querySelectorAll('.field-row');
        fieldRows.forEach(row => {
            const field = {
                name: row.querySelector('.field-name').value.trim(),
                data_type: row.querySelector('.field-data-type').value,
                requirement: row.querySelector('.field-requirement').value,
                verify: row.querySelector('.field-verify').checked
            };
            if (field.name) {  // Only add fields that have a name
                fields.push(field);
            }
        });
    }

    // Validate fields before submission
    for (const field of fields) {
        if (!field.name || !field.data_type || !field.requirement) {
            showAlert('danger', 'All fields must have a name, data type, and requirement level');
            return;
        }
        if (!['alphanumeric', 'numeric', 'date'].includes(field.data_type)) {
            showAlert('danger', 'Invalid data type. Must be alphanumeric, numeric, or date');
            return;
        }
        if (!['optional', 'essential'].includes(field.requirement)) {
            showAlert('danger', 'Invalid requirement level. Must be optional or essential');
            return;
        }
    }

    try {
        const response = await fetch(API.subDepartment(subDeptId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                department: parseInt(departmentId),
                name: subDeptName,
                sub_department_id: subDeptId,
                fields: fields
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.fields) {
                throw new Error(errorData.fields.join(', '));
            }
            throw new Error(errorData.detail || errorData.error || 'Failed to update sub-department');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('editSubDepartmentModal'));
        if (modal) {
            modal.hide();
        }
        
        await loadSubDepartments(currentPage);
        showAlert('success', 'Sub-department updated successfully');
    } catch (error) {
        console.error('Error updating sub-department:', error);
        showAlert('danger', error.message || 'Failed to update sub-department');
    }
}

// Clear Form
function clearForm() {
    if (subDepartmentForm) {
        subDepartmentForm.reset();
        subDepartmentForm.classList.remove('was-validated');
        if (fieldsContainer) {
            fieldsContainer.innerHTML = ''; // Clear all fields
        }
    }
}

// Update Pagination
function updatePagination(totalItems, currentPage) {
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / 10);
    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    pagination.innerHTML = paginationHTML;

    // Add click event listeners
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.closest('.page-link').dataset.page);
            if (page && page !== currentPage) {
                loadSubDepartments(page);
            }
        });
    });
}

// Show Alert
function showAlert(type, message) {
    // Use the global alert function from base.html
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const successMessage = successAlert.querySelector('.alert-message');
    const errorMessage = errorAlert.querySelector('.alert-message');

    // Hide both alerts first
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';

    if (type === 'success') {
        successMessage.textContent = message || 'Operation completed successfully!';
        successAlert.style.display = 'flex';
        setTimeout(() => {
            successAlert.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                successAlert.style.display = 'none';
                successAlert.style.animation = 'slideIn 0.3s ease';
            }, 300);
        }, 3000);
    } else {
        errorMessage.textContent = message || 'An error occurred.';
        errorAlert.style.display = 'flex';
        setTimeout(() => {
            errorAlert.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                errorAlert.style.display = 'none';
                errorAlert.style.animation = 'slideIn 0.3s ease';
            }, 300);
        }, 3000);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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