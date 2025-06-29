document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openBtn');
    const closeBtn = document.getElementById('closeBtn');
    const overlay = document.getElementById('sidebarOverlay');
    const mainContent = document.querySelector('.main-content');

    function isMobile() {
        return window.innerWidth <= 700;
    }

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        if (isMobile()) {
            document.body.classList.add('sidebar-open');
        }
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }

    openBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openSidebar();
    });

    closeBtn.addEventListener('click', function () {
        closeSidebar();
    });

    overlay.addEventListener('click', function () {
        closeSidebar();
    });

    // On resize, reset sidebar if going to desktop
    window.addEventListener('resize', function () {
        if (!isMobile()) {
            closeSidebar();
        }
    });
});