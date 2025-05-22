document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const userSelect = document.getElementById('userSelect');
    const permissionsForm = document.getElementById('permissionsForm');
    const saveButton = document.getElementById('saveButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const successAlert = document.querySelector('.alert-success');
    const errorAlert = document.querySelector('.alert-error');
    const selectAllBtn = document.getElementById('selectAllBtn');

    // State
    let currentPermissions = new Set();
    let isSelectAll = false;

    // Initialize
    initializeEventListeners();
    hideAlerts();

    function initializeEventListeners() {
        // User selection change
        userSelect.addEventListener('change', handleUserChange);

        // Form submission
        permissionsForm.addEventListener('submit', handleFormSubmit);

        // Select all button
        selectAllBtn.addEventListener('click', handleSelectAll);

        // Section toggles
        document.querySelectorAll('.permission-header').forEach(header => {
            header.addEventListener('click', () => toggleSection(header));
        });

        // Parent checkbox changes
        document.querySelectorAll('.parent-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleParentCheckboxChange);
        });

        // Child checkbox changes
        document.querySelectorAll('.child-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleChildCheckboxChange);
        });

        // CRUD operation checkbox changes
        document.querySelectorAll('.crud-operations .permission-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleCrudCheckboxChange);
                });
    }

    function handleUserChange() {
        const userId = userSelect.value;
        if (!userId) {
            resetForm();
            return;
            }

        showLoading();
        fetchUserPermissions(userId)
            .then(permissions => {
                updatePermissions(permissions);
                hideLoading();
            })
            .catch(error => {
                showError('Failed to load permissions. Please try again.');
                hideLoading();
    });
    }

    async function fetchUserPermissions(userId) {
        try {
            const response = await fetch(`/dashboard/user/get-permissions/${userId}/`);
            if (!response.ok) throw new Error('Failed to fetch permissions');
            const data = await response.json();
            return data.permissions; // Extract permissions from the response
        } catch (error) {
            console.error('Error fetching permissions:', error);
            throw error;
        }
    }

    function updatePermissions(permissions) {
        // Clear current permissions
        currentPermissions.clear();
        permissions.forEach(permission => currentPermissions.add(permission));

        // Update checkboxes
        document.querySelectorAll('.permission-checkbox').forEach(checkbox => {
            checkbox.checked = currentPermissions.has(checkbox.value);
        });

        // Update parent checkboxes based on child states
        updateParentCheckboxes();

        // Enable save button
        saveButton.disabled = false;
            }

    function handleParentCheckboxChange(event) {
        const checkbox = event.target;
        const section = checkbox.dataset.section;
            const childCheckboxes = document.querySelectorAll(`.child-checkbox[data-parent="${section}"]`);
        const crudCheckboxes = document.querySelectorAll(`.child-permissions[data-parent="${section}"] .crud-operations .permission-checkbox`);
            
        // Update child checkboxes
            childCheckboxes.forEach(child => {
            child.checked = checkbox.checked;
            updatePermission(child.value, checkbox.checked);
        });

        // Update CRUD checkboxes
                crudCheckboxes.forEach(crud => {
            crud.checked = checkbox.checked;
            updatePermission(crud.value, checkbox.checked);
    });

        // Update save button state
        updateSaveButtonState();
    }

    function handleChildCheckboxChange(event) {
        const checkbox = event.target;
        const section = checkbox.dataset.parent;
        const parentCheckbox = document.querySelector(`.parent-checkbox[data-section="${section}"]`);
        const crudCheckboxes = checkbox.closest('.permission-group').querySelectorAll('.crud-operations .permission-checkbox');

        // Update CRUD checkboxes
        crudCheckboxes.forEach(crud => {
            crud.checked = checkbox.checked;
            updatePermission(crud.value, checkbox.checked);
                    });

        // Update parent checkbox state
        updateParentCheckboxState(parentCheckbox);

        // Update permission
        updatePermission(checkbox.value, checkbox.checked);

        // Update save button state
        updateSaveButtonState();
    }

    function handleCrudCheckboxChange(event) {
        const checkbox = event.target;
        const childCheckbox = checkbox.closest('.permission-group').querySelector('.child-checkbox');
        const section = childCheckbox.dataset.parent;
        const parentCheckbox = document.querySelector(`.parent-checkbox[data-section="${section}"]`);

        // Update permission
        updatePermission(checkbox.value, checkbox.checked);

        // Update child checkbox state
        updateChildCheckboxState(childCheckbox);
                            
        // Update parent checkbox state
        updateParentCheckboxState(parentCheckbox);

        // Update save button state
        updateSaveButtonState();
    }

    function updateParentCheckboxState(parentCheckbox) {
        const section = parentCheckbox.dataset.section;
                                const childCheckboxes = document.querySelectorAll(`.child-checkbox[data-parent="${section}"]`);
        const allChecked = Array.from(childCheckboxes).every(child => child.checked);
        const someChecked = Array.from(childCheckboxes).some(child => child.checked);

        parentCheckbox.checked = allChecked;
        parentCheckbox.indeterminate = someChecked && !allChecked;
    }

    function updateChildCheckboxState(childCheckbox) {
        const crudCheckboxes = childCheckbox.closest('.permission-group').querySelectorAll('.crud-operations .permission-checkbox');
        const allChecked = Array.from(crudCheckboxes).every(crud => crud.checked);
        const someChecked = Array.from(crudCheckboxes).some(crud => crud.checked);

        childCheckbox.checked = allChecked;
        childCheckbox.indeterminate = someChecked && !allChecked;
    }

    function updateParentCheckboxes() {
        document.querySelectorAll('.parent-checkbox').forEach(parentCheckbox => {
            updateParentCheckboxState(parentCheckbox);
        });
    }

    function handleSelectAll() {
        isSelectAll = !isSelectAll;
        selectAllBtn.innerHTML = isSelectAll ? 
            '<i class="fas fa-times"></i> Deselect All Permissions' : 
            '<i class="fas fa-check-square"></i> Select All Permissions';

        document.querySelectorAll('.permission-checkbox').forEach(checkbox => {
            checkbox.checked = isSelectAll;
            updatePermission(checkbox.value, isSelectAll);
        });

        updateSaveButtonState();
    }

    function updatePermission(permission, isGranted) {
        if (isGranted) {
            currentPermissions.add(permission);
        } else {
            currentPermissions.delete(permission);
                            }
                        }

    function updateSaveButtonState() {
                    saveButton.disabled = false;
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const userId = userSelect.value;
        if (!userId) return;

        showLoading();
        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            Array.from(currentPermissions).forEach(perm => {
                formData.append('permissions[]', perm);
            });

            const response = await fetch('/dashboard/user/rights/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save permissions');
            }

            showSuccess('Permissions saved successfully');
            hideLoading();
            
            // Scroll to top of the page smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (error) {
            console.error('Error saving permissions:', error);
            showError(error.message || 'Failed to save permissions. Please try again.');
            hideLoading();
        }
    }

    function toggleSection(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');
        
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
            }

    function resetForm() {
        document.querySelectorAll('.permission-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        });
        currentPermissions.clear();
        saveButton.disabled = true;
        hideAlerts();
                }

    function showLoading() {
        loadingSpinner.style.display = 'flex';
        saveButton.disabled = true;
    }

    function hideLoading() {
            loadingSpinner.style.display = 'none';
    }

    function showSuccess(message) {
        successAlert.textContent = message;
        successAlert.style.display = 'block';
        setTimeout(hideAlerts, 3000);
    }

    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.style.display = 'block';
        setTimeout(hideAlerts, 3000);
        }

    function hideAlerts() {
        successAlert.style.display = 'none';
        errorAlert.style.display = 'none';
    }

    function getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
}); 