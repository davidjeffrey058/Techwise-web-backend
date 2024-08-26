function toggleDrawer(){
    const drawer = document.querySelector('.mobile_drawer');
    const overlay = document.querySelector('.mobile_drawer_background');
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
}