// API endpoints
const PERMISSIONS_API = {
    getUserPermissions: async (userId) => {
        try {
            console.log('Fetching permissions for user:', userId); // Debug log
            const response = await fetch(`/dashboard/user/get-permissions/${userId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            console.log('Response status:', response.status); // Debug log

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData); // Debug log
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const permissions = await response.json();
            console.log('Received permissions:', permissions); // Debug log
            return { permissions }; // Wrap in object to match expected format
        } catch (error) {
            console.error('Error fetching permissions:', error);
            throw error;
        }
    },
    updateUserPermissions: '/dashboard/user/rights/'
};

// Function to get user permissions
async function getUserPermissions(userId) {
    try {
        console.log('Fetching permissions for user:', userId); // Debug log
        const response = await fetch(PERMISSIONS_API.getUserPermissions(userId), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData); // Debug log
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const permissions = await response.json();
        console.log('Received permissions:', permissions); // Debug log
        return permissions;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        throw error;
    }
}

// Function to update user permissions
async function updateUserPermissions(userId, permissions) {
    try {
        console.log('Updating permissions for user:', userId, permissions); // Debug log
        const formData = new FormData();
        formData.append('user_id', userId);
        permissions.forEach(perm => {
            formData.append('permissions[]', perm);
        });

        const response = await fetch(PERMISSIONS_API.updateUserPermissions, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        console.log('Update response status:', response.status); // Debug log

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData); // Debug log
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Update response:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Error updating permissions:', error);
        throw error;
    }
}

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