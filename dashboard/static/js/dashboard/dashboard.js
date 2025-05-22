// Initialize Lucide icons
lucide.createIcons();

// Sidebar toggle functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('show');
    }
});

// Initialize dropdowns
const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
dropdownToggles.forEach(toggle => {
    const dropdown = new bootstrap.Dropdown(toggle);
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    dropdownToggles.forEach(toggle => {
        if (!toggle.contains(e.target)) {
            const dropdown = bootstrap.Dropdown.getInstance(toggle);
            if (dropdown) {
                dropdown.hide();
            }
        }
    });
});

// Initialize tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Handle submenu toggles
const submenuToggles = document.querySelectorAll('.submenu-toggle');
submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = toggle.nextElementSibling;
        if (submenu) {
            submenu.classList.toggle('show');
            toggle.classList.toggle('active');
        }
    });
});

// Handle notification badge
const notificationBadge = document.querySelector('.notification-badge');
if (notificationBadge) {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    notificationBadge.textContent = unreadCount;
    if (unreadCount === 0) {
        notificationBadge.style.display = 'none';
    }
}

// Handle mark all as read
const markAllRead = document.querySelector('.mark-all-read');
if (markAllRead) {
    markAllRead.addEventListener('click', (e) => {
        e.preventDefault();
        const unreadItems = document.querySelectorAll('.notification-item.unread');
        unreadItems.forEach(item => {
            item.classList.remove('unread');
        });
        if (notificationBadge) {
            notificationBadge.style.display = 'none';
        }
    });
}

// Handle active menu items
const currentPath = window.location.pathname;
const menuItems = document.querySelectorAll('.sidebar-menu a');
menuItems.forEach(item => {
    if (item.getAttribute('href') === currentPath) {
        item.parentElement.classList.add('active');
    }
}); 