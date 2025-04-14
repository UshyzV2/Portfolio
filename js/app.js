document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("btnAccueil").addEventListener("click", function(event) {
        event.preventDefault();
        scrollTo({top: 0, behavior: "smooth" });
    });
    
    document.getElementById("btnJeux").addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("jeux").scrollIntoView({ behavior: "smooth" });
    });

    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.navbar__menu');
  
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
    
});