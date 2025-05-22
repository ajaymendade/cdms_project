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
    divisionBranches: '/api/division-branches/',
    divisionBranch: (id) => `/api/division-branches/${id}/`
};

// Current page and items per page
let currentPage = 1;
const itemsPerPage = 10;

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

// Function to load division/branches
async function loadDivisionBranches(page = 1) {
    try {
        currentPage = page;
        const searchTerm = document.getElementById('searchInput').value;
        const url = `${API.divisionBranches}?page=${page}&per_page=${itemsPerPage}${searchTerm ? `&search=${searchTerm}` : ''}`;
        
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
        updateDivisionBranchTable(data.results || data);
        
        // Update pagination
        updatePagination(data.count || data.length, currentPage);
    } catch (error) {
        console.error('Error loading division/branches:', error);
        showAlert('danger', 'Failed to load division/branches. Please try again.');
    }
}

// Function to update division/branch table
function updateDivisionBranchTable(divisionBranches) {
    const tbody = document.getElementById('division-branch-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!divisionBranches || divisionBranches.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">No division/branches found</td>';
        tbody.appendChild(row);
        return;
    }

    divisionBranches.forEach(div => {
        const row = document.createElement('tr');
        
        // Create cells with proper data
        const cells = [
            div.division_id || '',
            div.name || '',
            div.address || '',
            createActionButtons(div)
        ];
        
        // Create row with cells
        row.innerHTML = cells.map(cell => `<td>${cell}</td>`).join('');
        
        tbody.appendChild(row);
    });
}

// Function to create action buttons
function createActionButtons(div) {
    console.log('Creating action buttons for division/branch:', div);
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'btn-group';
    
    // View button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-sm btn-info';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.title = 'View Division/Branch';
    viewBtn.setAttribute('data-bs-toggle', 'modal');
    viewBtn.setAttribute('data-bs-target', '#viewDivisionBranchModal');
    viewBtn.setAttribute('data-div-id', div.id);
    viewBtn.setAttribute('data-div-code', div.division_id);
    viewBtn.setAttribute('data-div-name', div.name);
    viewBtn.setAttribute('data-div-address', div.address);
    viewBtn.setAttribute('data-div-created', div.created_at);
    viewBtn.setAttribute('data-div-updated', div.updated_at);
    actionsDiv.appendChild(viewBtn);
    
    // Edit button - only show if user has update permission
    if (permissions.canUpdate) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Division/Branch';
        editBtn.setAttribute('data-bs-toggle', 'modal');
        editBtn.setAttribute('data-bs-target', '#editDivisionBranchModal');
        editBtn.setAttribute('data-div-id', div.id);
        editBtn.setAttribute('data-div-code', div.division_id);
        editBtn.setAttribute('data-div-name', div.name);
        editBtn.setAttribute('data-div-address', div.address);
        actionsDiv.appendChild(editBtn);
    }
    
    // Delete button - only show if user has delete permission
    if (permissions.canDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Division/Branch';
        deleteBtn.setAttribute('data-bs-toggle', 'modal');
        deleteBtn.setAttribute('data-bs-target', '#deleteConfirmModal');
        deleteBtn.setAttribute('data-div-id', div.id);
        deleteBtn.setAttribute('data-div-name', div.name);
        actionsDiv.appendChild(deleteBtn);
    }
    
    return actionsDiv.outerHTML;
}

// Function to save new division/branch
async function saveDivisionBranch(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const divisionId = document.getElementById('division-branch-id').value;
    const divisionName = document.getElementById('division-branch-name').value;
    const address = document.getElementById('division-branch-address').value;
    
    // Validate division ID is a number
    if (!/^\d+$/.test(divisionId)) {
        showAlert('danger', 'Division ID must be a number');
        return;
    }
    
    try {
        const response = await fetch(API.divisionBranches, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                division_id: parseInt(divisionId),
                name: divisionName,
                address: address
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.error || 'Failed to save division/branch');
        }
        
        // Clear form and reload division/branches
        form.reset();
        form.classList.remove('was-validated');
        loadDivisionBranches(currentPage);
        showAlert('success', 'Division/Branch saved successfully');
    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || 'Failed to save division/branch');
    }
}

// Function to save edited division/branch
async function saveEditedDivisionBranch() {
    const form = document.getElementById('edit-division-branch-form');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const divId = document.getElementById('edit-division-branch-id').value;
    const divisionName = document.getElementById('edit-division-branch-name').value;
    const address = document.getElementById('edit-division-branch-address').value;

    try {
        const response = await fetch(API.divisionBranch(divId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                division_id: parseInt(divId),
                name: divisionName,
                address: address
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.error || 'Failed to update division/branch');
        }

        // Close modal and reload data
        const modal = bootstrap.Modal.getInstance(document.getElementById('editDivisionBranchModal'));
        if (modal) {
            modal.hide();
        }
        
        loadDivisionBranches(currentPage);
        showAlert('success', 'Division/Branch updated successfully');
    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || 'Failed to update division/branch');
    }
}

// Function to delete division/branch
async function deleteDivisionBranch(id) {
    try {
        const response = await fetch(API.divisionBranch(id), {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.error || 'Failed to delete division/branch');
        }

        // Close modal and reload data
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            modal.hide();
        }
        
        loadDivisionBranches(currentPage);
        showAlert('success', 'Division/Branch deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || 'Failed to delete division/branch');
    }
}

// Function to update pagination
function updatePagination(totalItems, currentPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
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
                loadDivisionBranches(page);
            }
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadDivisionBranches();

    // Form submission
    const form = document.getElementById('division-branch-form');
    if (form) {
        form.addEventListener('submit', saveDivisionBranch);
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            loadDivisionBranches(1);
        }, 500));
    }

    // Save edit button
    const saveEditBtn = document.getElementById('save-edit-btn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedDivisionBranch);
    }

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const form = document.getElementById('division-branch-form');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
        });
    }

    // Modal event listeners
    const editDivisionBranchModal = document.getElementById('editDivisionBranchModal');
    if (editDivisionBranchModal) {
        editDivisionBranchModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const divId = button.getAttribute('data-div-id');
            const divName = button.getAttribute('data-div-name');
            const divAddress = button.getAttribute('data-div-address');

            document.getElementById('edit-division-branch-id').value = divId;
            document.getElementById('edit-division-branch-name').value = divName;
            document.getElementById('edit-division-branch-address').value = divAddress;
        });
    }

    const viewDivisionBranchModal = document.getElementById('viewDivisionBranchModal');
    if (viewDivisionBranchModal) {
        viewDivisionBranchModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const divCode = button.getAttribute('data-div-code');
            const divName = button.getAttribute('data-div-name');
            const divAddress = button.getAttribute('data-div-address');
            const divCreated = button.getAttribute('data-div-created');
            const divUpdated = button.getAttribute('data-div-updated');

            // Format dates if they exist
            const createdDate = divCreated ? new Date(divCreated).toLocaleString() : 'N/A';
            const updatedDate = divUpdated ? new Date(divUpdated).toLocaleString() : 'N/A';

            document.getElementById('view-division-branch-id').textContent = divCode || 'N/A';
            document.getElementById('view-division-branch-name').textContent = divName || 'N/A';
            document.getElementById('view-division-branch-address').textContent = divAddress || 'N/A';
        });
    }

    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const divId = button.getAttribute('data-div-id');
            const divName = button.getAttribute('data-div-name');

            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.onclick = async () => {
                try {
                    const response = await fetch(API.divisionBranch(divId), {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });
                    
                    if (response.ok) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                        modal.hide();
                        loadDivisionBranches(currentPage);
                        showAlert('success', 'Division/Branch deleted successfully');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete division/branch');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('danger', error.message || 'Failed to delete division/branch');
                }
            };
        });
    }
});

// Utility function for debouncing
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