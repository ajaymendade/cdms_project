// API endpoints
const API_ENDPOINTS = {
    branches: '/api/division-branches/',
    departments: '/api/departments/',
    subDepartments: '/api/sub-departments/',
    links: '/api/branch-department-links/'
};

// DOM elements
const branchSelect = document.getElementById('branchSelect');
const branchFilter = document.getElementById('branchFilter');
const departmentList = document.getElementById('departmentList');
const linkTable = document.getElementById('linkTable');
const linkTableBody = document.getElementById('linkTableBody');
const linkForm = document.getElementById('linkForm');

// State
let branches = [];
let departments = [];
let subDepartments = [];
let links = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize Application
async function initializeApp() {
    try {
        console.log('Initializing application...'); // Debug log
        await loadBranches();
        console.log('Branches loaded successfully'); // Debug log
        await loadLinks();
        console.log('Links loaded successfully'); // Debug log
        setupEventListeners();
        console.log('Event listeners set up successfully'); // Debug log
    } catch (error) {
        console.error('Error initializing application:', error);
        showAlert('error', 'Failed to initialize application. Please refresh the page.');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...'); // Debug log
    
    // Form submission
    if (linkForm) {
        linkForm.addEventListener('submit', handleFormSubmit);
    }

    // Branch filter change
    if (branchFilter) {
        branchFilter.addEventListener('change', () => {
            loadLinks();
        });
    }

    // Branch select change in modal
    if (branchSelect) {
        console.log('Setting up branch select change listener'); // Debug log
        branchSelect.addEventListener('change', async (event) => {
            const branchId = event.target.value;
            console.log('Branch selected:', branchId); // Debug log
            if (branchId) {
                try {
                    await Promise.all([
                        loadDepartments(),
                        loadSubDepartments()
                    ]);
                } catch (error) {
                    console.error('Error loading departments and sub-departments:', error);
                    showAlert('error', 'Failed to load departments and sub-departments');
                }
            } else {
                // Clear department list if no branch selected
                if (departmentList) {
                    departmentList.innerHTML = '<div class="text-muted">Please select a branch first</div>';
                }
            }
        });
    }
}

// Load branches
async function loadBranches() {
    try {
        const response = await fetch(API_ENDPOINTS.branches);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Branches data:', data); // Debug log
        
        // Handle both array and paginated response
        branches = Array.isArray(data) ? data : (data.results || []);
        
        if (branches.length === 0) {
            showAlert('error', 'No branches found. Please add branches first.');
            return;
        }
        
        // Clear existing options
        if (branchSelect) {
            branchSelect.innerHTML = '<option value="">Select Branch</option>';
        }
        if (branchFilter) {
            branchFilter.innerHTML = '<option value="">Select Branch to View Links</option>';
        }
        
        // Add new options
        branches.forEach(branch => {
            // Add to modal select
            if (branchSelect) {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = `${branch.name} (ID: ${branch.id})`;
                branchSelect.appendChild(option);
            }

            // Add to filter select
            if (branchFilter) {
                const filterOption = document.createElement('option');
                filterOption.value = branch.id;
                filterOption.textContent = `${branch.name} (ID: ${branch.id})`;
                branchFilter.appendChild(filterOption);
            }
        });

        // Log the branch select options for debugging
        if (branchSelect) {
            console.log('Branch select options:', branchSelect.innerHTML);
        }
    } catch (error) {
        console.error('Error loading branches:', error);
        showAlert('error', 'Failed to load branches. Please try again.');
        throw error; // Re-throw to handle in initializeApp
    }
}

// Populate Branch Selects
function populateBranchSelects() {
    const selects = [branchSelect, branchFilter];
    selects.forEach(select => {
        if (!select) return;
        
        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select Branch</option>';
        
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id;
            option.textContent = branch.name;
            select.appendChild(option);
        });
    });
}

// Load Departments
async function loadDepartments() {
    try {
        const response = await fetch(API_ENDPOINTS.departments);
        if (!response.ok) throw new Error('Failed to load departments');

        const data = await response.json();
        departments = data.departments || data.results || data;
        
        // Populate department list
        populateDepartmentList();
    } catch (error) {
        console.error('Error loading departments:', error);
        showAlert('error', 'Failed to load departments');
    }
}

// Load Sub-Departments
async function loadSubDepartments() {
    try {
        const response = await fetch(API_ENDPOINTS.subDepartments);
        if (!response.ok) throw new Error('Failed to load sub-departments');

        const data = await response.json();
        subDepartments = data.results || data;
        
        // Populate department list
        populateDepartmentList();
    } catch (error) {
        console.error('Error loading sub-departments:', error);
        showAlert('error', 'Failed to load sub-departments');
    }
}

// Populate Department List
function populateDepartmentList() {
    if (!departmentList) return;
    
    // Clear the list first
    departmentList.innerHTML = '';
    
    // Check if a branch is selected
    const selectedBranch = branchSelect.value;
    if (!selectedBranch) {
        departmentList.innerHTML = '<div class="text-muted">Please select a branch first</div>';
        return;
    }
    
    // Get existing links for the selected branch
    const existingLinks = links.filter(link => link.branch === parseInt(selectedBranch));
    
    // Create a container for departments
    const deptContainer = document.createElement('div');
    deptContainer.className = 'department-container';
    
    departments.forEach(dept => {
        const deptDiv = document.createElement('div');
        deptDiv.className = 'mb-3';
        
        // Check if department has sub-departments
        const deptSubDepts = subDepartments.filter(sub => sub.department === dept.id);
        const hasSubDepts = deptSubDepts.length > 0;
        
        // Department header
        const deptHeader = document.createElement('div');
        deptHeader.className = 'department-header mb-2';
        
        if (!hasSubDepts) {
            // If no sub-departments, show message
            deptHeader.innerHTML = `
                <div class="text-muted">
                    ${dept.department_id} - ${dept.name}
                    <span class="ms-2">(No sub-departments available)</span>
                </div>
            `;
        } else {
            // If has sub-departments, show department name
            deptHeader.innerHTML = `
                <div class="fw-bold">
                    ${dept.department_id} - ${dept.name}
                </div>
            `;
        }
        
        deptDiv.appendChild(deptHeader);
        
        // Sub-departments container
        const subDeptContainer = document.createElement('div');
        subDeptContainer.className = 'ms-4 mt-2';
        
        // Add sub-departments
        if (hasSubDepts) {
            deptSubDepts.forEach(subDept => {
                // Check if sub-department is already linked
                const isSubDeptLinked = existingLinks.some(link => 
                    link.sub_department === subDept.id
                );
                
                const subDeptCheckbox = document.createElement('div');
                subDeptCheckbox.className = 'form-check';
                subDeptCheckbox.innerHTML = `
                    <input type="checkbox" class="form-check-input sub-department-checkbox" 
                           id="subdept-${subDept.id}" value="${subDept.id}" 
                           data-department="${dept.id}"
                           ${isSubDeptLinked ? 'disabled checked' : ''}>
                    <label class="form-check-label" for="subdept-${subDept.id}">
                        ${subDept.sub_department_id} - ${subDept.name}
                        ${isSubDeptLinked ? '<span class="text-success ms-2">(Already Linked)</span>' : ''}
                    </label>
                `;
                subDeptContainer.appendChild(subDeptCheckbox);
            });
        }
        
        deptDiv.appendChild(subDeptContainer);
        deptContainer.appendChild(deptDiv);
    });
    
    departmentList.appendChild(deptContainer);
}

// Load Links
async function loadLinks() {
    try {
        const branchId = branchFilter ? branchFilter.value : '';
        const url = branchId ? `${API_ENDPOINTS.links}?branch=${branchId}` : API_ENDPOINTS.links;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        links = data.results || data;
        
        // Update the table
        updateLinkTable(links);
    } catch (error) {
        console.error('Error loading links:', error);
        showAlert('error', 'Failed to load branch department links');
        throw error;
    }
}

// Update Link Table
function updateLinkTable(links) {
    if (!linkTableBody) return;
    
    // Clear existing rows
    linkTableBody.innerHTML = '';
    
    if (!links || links.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No links found</td>';
        linkTableBody.appendChild(row);
        return;
    }
    
    links.forEach(link => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${link.branch_name || 'N/A'}</td>
            <td>${link.department_name || 'N/A'}</td>
            <td>${link.sub_department_name || '-'}</td>
            <td>
                <span class="badge ${link.is_active ? 'bg-success' : 'bg-danger'}">
                    ${link.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    ${permissions.canDelete ? `
                        <button type="button" class="btn btn-sm btn-danger" 
                                onclick="confirmDelete(${link.id}, '${link.branch_name} - ${link.department_name}')"
                                data-bs-toggle="tooltip" 
                                title="Delete Link">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        linkTableBody.appendChild(row);
    });
    
    // Initialize tooltips for new buttons
    const tooltipTriggerList = [].slice.call(linkTableBody.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Edit Link
function editLink(linkId) {
    const link = links.find(l => l.id === linkId);
    if (!link) return;
    
    // Set form values
    document.getElementById('linkId').value = link.id;
    if (branchSelect) branchSelect.value = link.branch;
    
    // Trigger branch change to load departments
    const event = new Event('change');
    branchSelect.dispatchEvent(event);
    
    // Open modal
    const modal = new bootstrap.Modal(document.getElementById('branchDepLinkModal'));
    modal.show();
}

// Confirm Delete
function confirmDelete(linkId, linkName) {
    document.getElementById('deleteLinkId').value = linkId;
    document.getElementById('deleteLinkName').textContent = linkName;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Reset Modal
function resetModal() {
    if (branchSelect) branchSelect.value = '';
    if (departmentList) departmentList.innerHTML = '<div class="text-muted">Please select a branch first</div>';
    if (linkForm) {
        linkForm.reset();
        linkForm.classList.remove('was-validated');
    }
}

// Handle Form Submit
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const branchId = branchSelect.value;
    if (!branchId) {
        showAlert('error', 'Please select a branch first');
        return;
    }
    
    // Get all selected sub-departments
    const selectedSubDepts = Array.from(document.querySelectorAll('.sub-department-checkbox:checked')).map(cb => ({
        id: cb.value,
        department: cb.dataset.department
    }));
    
    if (selectedSubDepts.length === 0) {
        showAlert('error', 'Please select at least one sub-department');
        return;
    }
    
    // Get existing links for the selected branch
    const existingLinks = links.filter(link => link.branch === parseInt(branchId));
    
    // Filter out already linked sub-departments
    const newSubDepts = selectedSubDepts.filter(subDept => 
        !existingLinks.some(link => 
            link.sub_department === parseInt(subDept.id)
        )
    );
    
    if (newSubDepts.length === 0) {
        showAlert('info', 'All selected sub-departments are already linked');
        const modal = bootstrap.Modal.getInstance(document.getElementById('branchDepLinkModal'));
        modal.hide();
        resetModal();
        return;
    }
    
    const isActive = document.getElementById('isActive').checked;
    
    try {
        // Create links for new sub-departments
        const linkPromises = newSubDepts.map(subDept => {
            const linkData = {
                branch: parseInt(branchId),
                department: parseInt(subDept.department),
                sub_department: parseInt(subDept.id),
                is_active: isActive
            };
            
            return fetch(API_ENDPOINTS.links, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(linkData)
            });
        });
        
        const responses = await Promise.all(linkPromises);
        
        // Check if all requests were successful
        const allSuccessful = responses.every(response => response.ok);
        
        if (allSuccessful) {
            showAlert('success', `Successfully linked ${newSubDepts.length} sub-department(s)`);
            const modal = bootstrap.Modal.getInstance(document.getElementById('branchDepLinkModal'));
            modal.hide();
            resetModal();
            loadLinks();
        } else {
            throw new Error('Some links could not be created');
        }
    } catch (error) {
        console.error('Error creating links:', error);
        showAlert('error', error.message);
    }
}

// Delete Link
async function deleteLink() {
    const linkId = document.getElementById('deleteLinkId').value;
    
    try {
        const response = await fetch(`${API_ENDPOINTS.links}${linkId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.error || 'Failed to delete link');
        }
        
        showAlert('success', 'Link deleted successfully');
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
        loadLinks();
    } catch (error) {
        console.error('Error deleting link:', error);
        showAlert('error', error.message);
    }
}

// Show Alert
function showAlert(type, message) {
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