document.addEventListener('DOMContentLoaded', function() {
    const logoUploadForm = document.getElementById('logoUploadForm');
    const logoFile = document.getElementById('logoFile');
    const logoPreview = document.getElementById('logoPreview');
    const logosTableBody = document.getElementById('logosTableBody');
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    const modalPreview = document.getElementById('modalPreview');

    // Get CSRF token from cookie
    function getCSRFToken() {
        const name = 'csrftoken';
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

    // Preview logo before upload
    logoFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                logoPreview.src = e.target.result;
                logoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Show preview in modal
    window.showPreview = function(base64String) {
        const imageSrc = `data:image/png;base64,${base64String}`;
        modalPreview.src = imageSrc;
        previewModal.show();
    };

    // Load logos
    function loadLogos() {
        if (!permissions.canView) {
            showAlert('error', 'You do not have permission to view logos');
            return;
        }

        fetch('/api/logos/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('You do not have permission to view logos');
                }
                throw new Error('Failed to load logos');
            }
            return response.json();
        })
        .then(data => {
            console.log('Loaded logos:', data);
            if (!data) return;
            
            logosTableBody.innerHTML = '';
            data.forEach(logo => {
                const row = document.createElement('tr');
                const actionsCell = `
                    <td>
                        <button class="btn btn-sm btn-info me-2" onclick="showPreview('${logo.logo_data}')">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        ${permissions.canUpdate ? `
                        <button class="btn btn-sm btn-primary me-2" onclick="setActive(${logo.id})" ${logo.is_active ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> Set Active
                        </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                        <button class="btn btn-sm btn-danger" onclick="deleteLogo(${logo.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </td>`;

                row.innerHTML = `
                    <td>${logo.name}</td>
                    <td>${logo.organization_name}</td>
                    <td>
                        <span class="badge ${logo.is_active ? 'bg-success' : 'bg-secondary'} status-badge">
                            ${logo.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>${new Date(logo.created_at).toLocaleString()}</td>
                    ${actionsCell}
                `;
                logosTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading logos:', error);
            showAlert('error', error.message || 'Failed to load logos');
        });
    }

    // Upload logo
    if (logoUploadForm) {
        logoUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!permissions.canCreate) {
                showAlert('error', 'You do not have permission to create logos');
                return;
            }
            
            const file = logoFile.files[0];
            if (!file) {
                showAlert('error', 'Please select a file to upload');
                return;
            }

            // Log file details
            console.log('File details:', {
                name: file.name,
                type: file.type,
                size: file.size,
            });

            // Convert file to base64
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Data = e.target.result;
                console.log('Base64 data length:', base64Data.length);
                console.log('Base64 data preview:', base64Data.substring(0, 100) + '...');
                
                // Get form values
                const organizationName = document.getElementById('organizationName').value;
                const logoName = document.getElementById('logoName').value;
                const isActive = document.getElementById('setActive').checked;

                // Validate required fields
                if (!organizationName) {
                    showAlert('error', 'Organization name is required');
                    return;
                }
                if (!logoName) {
                    showAlert('error', 'Logo name is required');
                    return;
                }

                const data = {
                    name: logoName,
                    organization_name: organizationName,
                    logo_data: base64Data,
                    is_active: isActive
                };

                fetch('/api/logos/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    console.log('Upload response status:', response.status);
                    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
                    if (!response.ok) {
                        return response.text().then(text => {
                            console.log('Error response text:', text);
                            let errorMessage;
                            try {
                                const errorData = JSON.parse(text);
                                errorMessage = errorData.detail || errorData.message || 'Upload failed';
                                console.log('Parsed error data:', errorData);
                            } catch {
                                errorMessage = text || 'Upload failed';
                                console.log('Raw error text:', text);
                            }
                            throw new Error(errorMessage);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Upload success response:', data);
                    showAlert('success', 'Logo uploaded successfully');
                    logoUploadForm.reset();
                    logoPreview.style.display = 'none';
                    loadLogos();
                })
                .catch(error => {
                    console.error('Error uploading logo:', error);
                    showAlert('error', error.message || 'Failed to upload logo');
                });
            };
            reader.readAsDataURL(file);
        });
    }

    // Set logo as active
    window.setActive = function(logoId) {
        if (!permissions.canUpdate) {
            showAlert('error', 'You do not have permission to update logos');
            return;
        }

        fetch(`/api/logos/${logoId}/`, {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active: true })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to set active');
            return response.json();
        })
        .then(data => {
            showAlert('success', 'Logo set as active');
            loadLogos();
        })
        .catch(error => {
            console.error('Error setting active:', error);
            showAlert('error', 'Failed to set logo as active');
        });
    };

    // Delete logo
    window.deleteLogo = function(logoId) {
        if (!permissions.canDelete) {
            showAlert('error', 'You do not have permission to delete logos');
            return;
        }

        if (!confirm('Are you sure you want to delete this logo?')) return;

        fetch(`/api/logos/${logoId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete');
            showAlert('success', 'Logo deleted successfully');
            loadLogos();
        })
        .catch(error => {
            console.error('Error deleting logo:', error);
            showAlert('error', 'Failed to delete logo');
        });
    };

    // Initial load
    loadLogos();
}); 