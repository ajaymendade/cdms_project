// API endpoints
const API = {
    dataEntries: '/api/data-entry/',
    dataEntry: (id) => `/api/data-entry/${id}/`,
    getHierarchy: '/api/data-entry/get_hierarchy/',
    getSubDepartmentFields: '/api/data-entry/get_subdepartment_fields/'
};

// State
let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let currentEntry = null;
let currentFields = [];

// DOM Elements
const searchForm = document.getElementById('search-form');
const editForm = document.getElementById('edit-data-form');
const editFormContainer = document.getElementById('edit-form-container');
const resultsBody = document.getElementById('results-body');
const pagination = document.getElementById('pagination');
const resultsCount = document.querySelector('.results-count');
const closeEditFormBtn = document.getElementById('close-edit-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const deleteEntryBtn = document.getElementById('delete-entry-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const clearFiltersBtn = document.getElementById('clear-filters');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadHierarchy();
});

// Event Listeners
function setupEventListeners() {
    // Search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Edit form submission
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }

    // Form close/cancel buttons
    if (closeEditFormBtn) {
        closeEditFormBtn.addEventListener('click', closeEditForm);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditForm);
    }

    // Delete entry handling
    if (deleteEntryBtn) {
        deleteEntryBtn.addEventListener('click', showDeleteConfirmation);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleDelete);
    }

    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Division/Branch change
    const divisionFilter = document.getElementById('division-filter');
    if (divisionFilter) {
        divisionFilter.addEventListener('change', handleDivisionChange);
    }

    // Department change
    const departmentFilter = document.getElementById('department-filter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', handleDepartmentChange);
    }

    // Sub-department change
    const subDepartmentFilter = document.getElementById('subdepartment-filter');
    if (subDepartmentFilter) {
        subDepartmentFilter.addEventListener('change', handleSubDepartmentChange);
    }

    // Edit form division change
    const editDivision = document.getElementById('edit-division');
    if (editDivision) {
        editDivision.addEventListener('change', handleEditDivisionChange);
    }

    // Edit form department change
    const editDepartment = document.getElementById('edit-department');
    if (editDepartment) {
        editDepartment.addEventListener('change', handleEditDepartmentChange);
    }
}

// Load Hierarchy
async function loadHierarchy() {
    try {
        const response = await fetch(API.getHierarchy);
        if (!response.ok) throw new Error('Failed to load hierarchy');

        const data = await response.json();
        populateDivisionSelects(data);
    } catch (error) {
        console.error('Error loading hierarchy:', error);
        showAlert('danger', 'Failed to load division/branch data');
    }
}

// Populate Division Selects
function populateDivisionSelects(branches) {
    const selects = ['division-filter', 'edit-division'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select Division/Branch</option>';
        
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id;
            option.textContent = branch.name;
            select.appendChild(option);
        });
    });
}

// Handle Division Change
async function handleDivisionChange(event) {
    const divisionId = event.target.value;
    const departmentSelect = document.getElementById('department-filter');
    const subDepartmentSelect = document.getElementById('subdepartment-filter');

    // Reset and disable dependent dropdowns
    departmentSelect.innerHTML = '<option value="">Select Department</option>';
    subDepartmentSelect.innerHTML = '<option value="">Select Sub Department</option>';
    subDepartmentSelect.disabled = true;
    departmentSelect.disabled = true;

    if (!divisionId) {
        return;
    }

    try {
        const response = await fetch(`${API.getHierarchy}?branch=${divisionId}`);
        if (!response.ok) throw new Error('Failed to load departments');

        const data = await response.json();
        const branch = data.find(b => b.id === parseInt(divisionId));
        
        if (branch && branch.departments) {
            departmentSelect.disabled = false;
            branch.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        showAlert('danger', 'Failed to load departments');
    }
}

// Handle Department Change
async function handleDepartmentChange(event) {
    const departmentId = event.target.value;
    const subDepartmentSelect = document.getElementById('subdepartment-filter');

    // Reset and disable sub-department dropdown
    subDepartmentSelect.innerHTML = '<option value="">Select Sub Department</option>';
    subDepartmentSelect.disabled = true;

    if (!departmentId) {
        return;
    }

    try {
        const response = await fetch(API.getHierarchy);
        if (!response.ok) throw new Error('Failed to load sub-departments');

        const data = await response.json();
        const branch = data.find(b => b.departments.some(d => d.id === parseInt(departmentId)));
        
        if (branch) {
            const department = branch.departments.find(d => d.id === parseInt(departmentId));
            if (department && department.sub_departments) {
                subDepartmentSelect.disabled = false;
                department.sub_departments.forEach(subDept => {
                    const option = document.createElement('option');
                    option.value = subDept.id;
                    option.textContent = subDept.name;
                    subDepartmentSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading sub-departments:', error);
        showAlert('danger', 'Failed to load sub-departments');
    }
}

// Handle Sub-department Change
async function handleSubDepartmentChange(event) {
    const subDepartmentId = event.target.value;
    if (!subDepartmentId) return;

    try {
        const response = await fetch(`${API.getSubDepartmentFields}?sub_department_id=${subDepartmentId}`);
        if (!response.ok) throw new Error('Failed to load fields');

        const data = await response.json();
        currentFields = data.fields;
        createFieldFilters(data.fields);
    } catch (error) {
        console.error('Error loading fields:', error);
        showAlert('danger', 'Failed to load fields');
    }
}

// Create Field Filters
function createFieldFilters(fields) {
    const filterContainer = document.getElementById('field-filters');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';
    
    fields.forEach(field => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        
        const input = document.createElement('input');
        input.type = field.data_type === 'date' ? 'date' : 'text';
        input.className = 'form-control';
        input.id = `filter-${field.name}`;
        input.name = `field_${field.name}`;
        input.placeholder = `Search ${field.name}`;
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.htmlFor = `filter-${field.name}`;
        label.textContent = field.name;
        
        col.appendChild(label);
        col.appendChild(input);
        filterContainer.appendChild(col);
    });
}

// Handle Search
async function handleSearch(event) {
    event.preventDefault();
    
    // Validate required fields
    const divisionId = document.getElementById('division-filter').value;
    const departmentId = document.getElementById('department-filter').value;
    const subDepartmentId = document.getElementById('subdepartment-filter').value;

    if (!divisionId || !departmentId || !subDepartmentId) {
        showAlert('danger', 'Please select Division/Branch, Department, and Sub Department');
        return;
    }

    const formData = new FormData(event.target);
    const searchParams = new URLSearchParams();

    // Add search parameters
    for (const [key, value] of formData.entries()) {
        if (value) searchParams.append(key, value);
    }

    // Add pagination
    searchParams.append('page', currentPage);
    searchParams.append('per_page', 10);

    try {
        const response = await fetch(`${API.dataEntries}search/?${searchParams.toString()}`);
        if (!response.ok) throw new Error('Failed to search entries');

        const data = await response.json();
        updateResultsTable(data.results);
        updatePagination(data.count);
        resultsCount.textContent = `${data.count} entries found`;
    } catch (error) {
        console.error('Error searching entries:', error);
        showAlert('danger', 'Failed to search entries');
    }
}

// Update Results Table
function updateResultsTable(entries) {
    if (!resultsBody) return;

    resultsBody.innerHTML = '';
    
    if (!entries || entries.length === 0) {
        resultsBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">No entries found</td>
            </tr>
        `;
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement('tr');
        
        // Create cells for each field
        const cells = [
            entry.id,
            entry.branch_name,
            entry.department_name,
            entry.sub_department_name,
            new Date(entry.created_at).toLocaleDateString()
        ];

        // Add file name cell
        if (entry.files && entry.files.length > 0) {
            cells.push(entry.files[0].file_name);
        } else {
            cells.push('<span class="text-muted">No file</span>');
        }

        // Add fields view button if user has view permission
        if (entry.can_view) {
            const fieldValues = entry.field_values || {};
            cells.push(`
                <button class="btn btn-sm btn-outline-info view-fields" 
                        data-bs-toggle="modal" 
                        data-bs-target="#fieldsViewModal"
                        data-entry-id="${entry.id}"
                        data-fields='${JSON.stringify(fieldValues)}'>
                    <i class="fas fa-list me-1"></i> View Fields
                </button>
            `);
        } else {
            cells.push('No access');
        }

        // Add action buttons based on permissions
        const actionButtons = [];
        
        if (entry.can_update) {
            actionButtons.push(`
                <button class="btn btn-sm btn-primary edit-entry" data-entry-id="${entry.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            `);
        }
        
        if (entry.can_delete) {
            actionButtons.push(`
                <button class="btn btn-sm btn-danger delete-entry" data-entry-id="${entry.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            `);
        }

        // Add download and view details buttons if file exists
        if (entry.files && entry.files.length > 0) {
            actionButtons.push(`
                <button class="btn btn-sm btn-success download-file" data-entry-id="${entry.id}" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-info view-file-details" data-entry-id="${entry.id}" title="View Details">
                    <i class="fas fa-info-circle"></i>
                </button>
            `);
        }

        cells.push(`
            <div class="btn-group" role="group">
                ${actionButtons.join('')}
            </div>
        `);

        row.innerHTML = cells.map(cell => `<td>${cell}</td>`).join('');
        resultsBody.appendChild(row);
    });

    // Add event listeners to buttons
    resultsBody.querySelectorAll('.edit-entry').forEach(btn => {
        btn.addEventListener('click', () => loadEntryForEdit(btn.dataset.entryId));
    });

    resultsBody.querySelectorAll('.delete-entry').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showDeleteConfirmation(btn.dataset.entryId);
        });
    });

    resultsBody.querySelectorAll('.view-fields').forEach(btn => {
        btn.addEventListener('click', () => {
            const fields = JSON.parse(btn.dataset.fields);
            showFieldsModal(fields);
        });
    });

    resultsBody.querySelectorAll('.download-file').forEach(btn => {
        btn.addEventListener('click', () => handleDownload(btn.dataset.entryId));
    });

    resultsBody.querySelectorAll('.view-file-details').forEach(btn => {
        btn.addEventListener('click', () => showFileDetails(btn.dataset.entryId));
    });
}

// Show Fields Modal
function showFieldsModal(fields) {
    const modalBody = document.getElementById('fields-modal-body');
    modalBody.innerHTML = '';

    const fieldsList = document.createElement('div');
    fieldsList.className = 'list-group';

    Object.entries(fields).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <strong>${key}</strong>
                <span>${value}</span>
            </div>
        `;
        fieldsList.appendChild(item);
    });

    modalBody.appendChild(fieldsList);
}

// Update Pagination
function updatePagination(totalItems) {
    const itemsPerPage = 10;
    totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <button class="page-link" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    prevLi.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            handleSearch(new Event('submit'));
        }
    });
    pagination.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${currentPage === i ? 'active' : ''}`;
        li.innerHTML = `
            <button class="page-link">${i}</button>
        `;
        li.addEventListener('click', () => {
            currentPage = i;
            handleSearch(new Event('submit'));
        });
        pagination.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <button class="page-link" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    nextLi.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            handleSearch(new Event('submit'));
        }
    });
    pagination.appendChild(nextLi);
}

// Load Entry for Edit
async function loadEntryForEdit(entryId) {
    try {
        const response = await fetch(API.dataEntry(entryId));
        if (!response.ok) throw new Error('Failed to load entry');

        const entry = await response.json();
        currentEntry = entry;

        // Populate form fields
        document.getElementById('edit-entry-id').value = entry.id;
        document.getElementById('edit-entry-number').value = entry.id;
        
        // Set division and trigger department loading
        const divisionSelect = document.getElementById('edit-division');
        divisionSelect.value = entry.branch;
        await handleEditDivisionChange({ target: divisionSelect });

        // Set department and trigger sub-department loading
        const departmentSelect = document.getElementById('edit-department');
        departmentSelect.value = entry.department;
        await handleEditDepartmentChange({ target: departmentSelect });

        // Set sub-department
        document.getElementById('edit-subdepartment').value = entry.sub_department;

        // Load dynamic fields
        await loadSubDepartmentFields(entry.sub_department, entry.field_values);

        // Display current file information if exists
        const currentFileInfo = document.getElementById('current-file-info');
        if (entry.files && entry.files.length > 0) {
            const file = entry.files[0];
            currentFileInfo.innerHTML = `
                <div class="alert alert-info">
                    <strong>Current File:</strong> ${file.file_name} (${formatFileSize(file.file_size)})
                </div>
            `;
        } else {
            currentFileInfo.innerHTML = `
                <div class="alert alert-secondary">
                    No file currently attached
                </div>
            `;
        }

        // Show edit form
        editFormContainer.style.display = 'block';
    } catch (error) {
        console.error('Error loading entry:', error);
        showAlert('danger', 'Failed to load entry for editing');
    }
}

// Load Sub Department Fields
async function loadSubDepartmentFields(subDepartmentId, fieldValues = {}) {
    try {
        const response = await fetch(`${API.getSubDepartmentFields}?sub_department_id=${subDepartmentId}`);
        if (!response.ok) throw new Error('Failed to load fields');

        const data = await response.json();
        const fieldsContainer = document.getElementById('edit-dynamic-fields');
        fieldsContainer.innerHTML = '';

        data.fields.forEach(field => {
            const value = fieldValues[field.name] || '';
            const fieldHtml = createDynamicField(field, value);
            fieldsContainer.appendChild(fieldHtml);
        });
    } catch (error) {
        console.error('Error loading fields:', error);
        showAlert('danger', 'Failed to load fields');
    }
}

// Create Dynamic Field
function createDynamicField(field, value) {
    const div = document.createElement('div');
    div.className = 'col-md-4';

    let inputHtml = '';
    switch (field.data_type) {
        case 'date':
            inputHtml = `
                <input type="date" class="form-control" 
                    name="field_${field.name}" 
                    value="${value}"
                    ${field.requirement === 'essential' ? 'required' : ''}>
            `;
            break;
        case 'numeric':
            inputHtml = `
                <input type="number" class="form-control" 
                    name="field_${field.name}" 
                    value="${value}"
                    ${field.requirement === 'essential' ? 'required' : ''}>
            `;
            break;
        default:
            inputHtml = `
                <input type="text" class="form-control" 
                    name="field_${field.name}" 
                    value="${value}"
                    ${field.requirement === 'essential' ? 'required' : ''}>
            `;
    }

    div.innerHTML = `
        <label class="form-label">${field.name}</label>
        ${inputHtml}
    `;

    return div;
}

// Handle Edit Submit
async function handleEditSubmit(event) {
    event.preventDefault();
    if (!currentEntry) return;

    const formData = new FormData(event.target);
    const data = {
        branch: formData.get('division'),
        department: formData.get('department'),
        sub_department: formData.get('subdepartment'),
        field_values: {}
    };

    // Collect field values
    formData.forEach((value, key) => {
        if (key.startsWith('field_')) {
            const fieldName = key.replace('field_', '');
            data.field_values[fieldName] = value;
        }
    });

    try {
        // Create a new FormData for the request
        const requestData = new FormData();
        requestData.append('data', JSON.stringify(data));

        // Handle file updates
        const removeFile = formData.get('remove_file') === 'on';
        const newFile = formData.get('file');

        if (removeFile) {
            requestData.append('remove_file', 'true');
        } else if (newFile && newFile.size > 0) {
            requestData.append('file', newFile);
        }

        const response = await fetch(API.dataEntry(currentEntry.id), {
            method: 'PUT',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: requestData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update entry');
        }

        // Close the form first
        closeEditForm();
        
        // Show success alert using the global alert function
        window.showAlert('success', 'Entry updated successfully');

        // Get current search parameters
        const searchFormData = new FormData(searchForm);
        const searchParams = new URLSearchParams();

        // Add search parameters
        for (const [key, value] of searchFormData.entries()) {
            if (value) searchParams.append(key, value);
}

        // Add pagination
        searchParams.append('page', currentPage);
        searchParams.append('per_page', 10);

        // Refresh search results
        const searchResponse = await fetch(`${API.dataEntries}search/?${searchParams.toString()}`);
        if (!searchResponse.ok) throw new Error('Failed to refresh search results');
        
        const searchData = await searchResponse.json();
        updateResultsTable(searchData.results);
        updatePagination(searchData.count);
        resultsCount.textContent = `${searchData.count} entries found`;

    } catch (error) {
        console.error('Error updating entry:', error);
        window.showAlert('danger', error.message || 'Failed to update entry');
    }
}

// Delete Entry
function showDeleteConfirmation(entryId) {
    if (typeof entryId === 'object') {
        entryId = entryId.target.dataset.entryId;
    }
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    document.getElementById('delete-entry-number').textContent = entryId;
    document.getElementById('confirm-delete-btn').dataset.entryId = entryId;
    modal.show();
}

async function handleDelete(event) {
    event.preventDefault();
    const entryId = event.target.dataset.entryId;
    if (!entryId) {
        window.showAlert('error', 'Invalid entry ID');
        return;
    }

    try {
        const response = await fetch(API.dataEntry(entryId), {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete entry');
        }

        // Close the modal first
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            modal.hide();
        }

        // Show success message using global alert
        window.showAlert('success', 'Entry deleted successfully');

        // Refresh the search results
        const formData = new FormData(searchForm);
        const searchParams = new URLSearchParams();

        // Add search parameters
        for (const [key, value] of formData.entries()) {
            if (value) searchParams.append(key, value);
        }

        // Add pagination
        searchParams.append('page', currentPage);
        searchParams.append('per_page', 10);

        const searchResponse = await fetch(`${API.dataEntries}search/?${searchParams.toString()}`);
        if (!searchResponse.ok) throw new Error('Failed to refresh search results');

        const data = await searchResponse.json();
        updateResultsTable(data.results);
        updatePagination(data.count);
        resultsCount.textContent = `${data.count} entries found`;

    } catch (error) {
        console.error('Error deleting entry:', error);
        window.showAlert('error', error.message || 'Failed to delete entry');
    }
}

// Handle Download
async function handleDownload(entryId) {
    try {
        const response = await fetch(`${API.dataEntry(entryId)}download_file/`);
        if (!response.ok) throw new Error('Failed to load document');
        
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'document.pdf';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        // Get the file data as a blob
        const blob = await response.blob();
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error downloading document:', error);
        showAlert('danger', 'Failed to download document');
    }
}

// Show File Details
async function showFileDetails(entryId) {
    try {
        const response = await fetch(API.dataEntry(entryId));
        if (!response.ok) throw new Error('Failed to load entry details');
        
        const entry = await response.json();
        
        // Populate record details
        const recordDetails = document.getElementById('record-details');
        recordDetails.innerHTML = `
            <tr><td><strong>Record ID:</strong></td><td>${entry.id}</td></tr>
            <tr><td><strong>Branch:</strong></td><td>${entry.branch_name}</td></tr>
            <tr><td><strong>Department:</strong></td><td>${entry.department_name}</td></tr>
            <tr><td><strong>Sub Department:</strong></td><td>${entry.sub_department_name}</td></tr>
            <tr><td><strong>Created At:</strong></td><td>${new Date(entry.created_at).toLocaleString()}</td></tr>
            <tr><td><strong>Created By:</strong></td><td>${entry.created_by || 'N/A'}</td></tr>
        `;

        // Populate file details
        const fileDetails = document.getElementById('file-details');
        if (entry.files && entry.files.length > 0) {
            const file = entry.files[0]; // Get the first file
            fileDetails.innerHTML = `
                <tr><td><strong>File Name:</strong></td><td>${file.file_name}</td></tr>
                <tr><td><strong>File Type:</strong></td><td>${file.file_type}</td></tr>
                <tr><td><strong>File Size:</strong></td><td>${formatFileSize(file.file_size)}</td></tr>
                <tr><td><strong>Uploaded At:</strong></td><td>${new Date(file.created_at).toLocaleString()}</td></tr>
            `;
        } else {
            fileDetails.innerHTML = '<tr><td colspan="2" class="text-center">No file information available</td></tr>';
        }

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('fileDetailsModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading file details:', error);
        showAlert('danger', 'Failed to load file details');
    }
}

// Clear Filters
function clearFilters() {
    searchForm.reset();
    document.getElementById('department-filter').disabled = true;
    document.getElementById('subdepartment-filter').disabled = true;
    document.getElementById('field-filters').innerHTML = '';
    handleSearch(new Event('submit'));
}

// Close Edit Form
function closeEditForm() {
    editFormContainer.style.display = 'none';
    editForm.reset();
    currentEntry = null;
    
    // Clear file info
    const currentFileInfo = document.getElementById('current-file-info');
    if (currentFileInfo) {
        currentFileInfo.innerHTML = '';
    }
    
    // Clear dynamic fields
    const dynamicFields = document.getElementById('edit-dynamic-fields');
    if (dynamicFields) {
        dynamicFields.innerHTML = '';
    }
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Show Alert
function showAlert(type, message) {
    // Use the global showAlert function from base.html
    window.showAlert(type, message);
}

// Handle Edit Division Change
async function handleEditDivisionChange(event) {
    const divisionId = event.target.value;
    const departmentSelect = document.getElementById('edit-department');
    const subDepartmentSelect = document.getElementById('edit-subdepartment');

    // Reset and disable dependent dropdowns
    departmentSelect.innerHTML = '<option value="">Select Department</option>';
    subDepartmentSelect.innerHTML = '<option value="">Select Sub Department</option>';
    subDepartmentSelect.disabled = true;
    departmentSelect.disabled = true;

    if (!divisionId) {
        return;
    }

    try {
        const response = await fetch(`${API.getHierarchy}?branch=${divisionId}`);
        if (!response.ok) throw new Error('Failed to load departments');

        const data = await response.json();
        const branch = data.find(b => b.id === parseInt(divisionId));
        
        if (branch && branch.departments) {
            departmentSelect.disabled = false;
            branch.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        showAlert('danger', 'Failed to load departments');
    }
}

// Handle Edit Department Change
async function handleEditDepartmentChange(event) {
    const departmentId = event.target.value;
    const subDepartmentSelect = document.getElementById('edit-subdepartment');

    // Reset and disable sub-department dropdown
    subDepartmentSelect.innerHTML = '<option value="">Select Sub Department</option>';
    subDepartmentSelect.disabled = true;

    if (!departmentId) {
        return;
    }

    try {
        const response = await fetch(API.getHierarchy);
        if (!response.ok) throw new Error('Failed to load sub-departments');

        const data = await response.json();
        const branch = data.find(b => b.departments.some(d => d.id === parseInt(departmentId)));
        
        if (branch) {
            const department = branch.departments.find(d => d.id === parseInt(departmentId));
            if (department && department.sub_departments) {
                subDepartmentSelect.disabled = false;
                department.sub_departments.forEach(subDept => {
                    const option = document.createElement('option');
                    option.value = subDept.id;
                    option.textContent = subDept.name;
                    subDepartmentSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading sub-departments:', error);
        showAlert('danger', 'Failed to load sub-departments');
    }
} 