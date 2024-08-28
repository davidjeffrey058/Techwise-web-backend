function toggleDrawer() {
    const drawer = document.querySelector('.mobile_drawer');
    const overlay = document.querySelector('.mobile_drawer_background');
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
}

function togglePopup() {
    const popup = document.querySelector('.pop_up');
    const popupBackground = document.querySelector('.pop_up_background');

    popup.classList.toggle('active')
    popupBackground.classList.toggle('active')
}