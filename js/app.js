
const html = document.documentElement;
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);
    
document.getElementById('themeToggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});
    
const panels = document.querySelectorAll('.accord-panel');
panels.forEach(panel => {
    panel.addEventListener('click', () => {
    if (panel.classList.contains('active')) return;
    panels.forEach(p => p.classList.remove('active'));
    panel.classList.add('active');
    });
});
    
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
