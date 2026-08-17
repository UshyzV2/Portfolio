// ============================================================
// 1. THÈME (Clair / Sombre)
// ============================================================
const html = document.documentElement;
let saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

let lightModeState = saved === 'light' ? 1.0 : 0.0;

document.getElementById('themeToggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    lightModeState = next === 'light' ? 1.0 : 0.0;
});

// ============================================================
// 2. HAMBURGER MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });
}

// ============================================================
// 3. FADE-UP (Intersection Observer)
// ============================================================
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ============================================================
// 4. DONNÉES PROJETS (JSON)
// ============================================================
let tousLesProjets = [];

function chargerProjets() {
    fetch('data/projets.json')
        .then(res => res.json())
        .then(data => {
            tousLesProjets = data;
            const page = window.location.pathname.split('/').pop();

            if (page === 'index.html' || page === '') {
                const phares = tousLesProjets.filter(p => p.est_phare === true && p.type === 'jeu');
                const recents = tousLesProjets.filter(p => p.type === 'jeu').slice(0, 6);
                afficherAccordion(phares);
                afficherJeuxRecents(recents);
            } else if (page === 'projects.html') {
                const jeux = tousLesProjets.filter(p => p.type === 'jeu');
                afficherTousLesJeux(jeux);
                genererFiltres(jeux);
            } else if (page === 'art.html') {
                const arts = tousLesProjets.filter(p => p.type === 'art');
                afficherArt(arts);
            }
        })
        .catch(err => console.error('Erreur chargement JSON :', err));
}

// ============================================================
// 5. ACCORDÉON (Projets phares) - VERSION SANS INLINE STYLES
// ============================================================

// Fonction utilitaire : supprime accents, espaces, caractères spéciaux
function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')                       // Décompose les accents (é -> e + ́)
        .replace(/[\u0300-\u036f]/g, '')        // Enlève les accents
        .replace(/[^a-z0-9]/g, '');             // 🟢 SUPPRIME TOUT CE QUI N'EST PAS LETTRE OU CHIFFRE
}

function afficherAccordion(projetsPhare) {
    const container = document.getElementById('accordion-phare');
    if (!container) return;
    container.innerHTML = '';

    projetsPhare.forEach((projet, index) => {
        const panel = document.createElement('div');
        panel.className = `accord-panel ${index === 0 ? 'active' : ''}`;
        const id = slugify(projet.titre);
        panel.dataset.id = id;

        // AUCUNE couleur en inline, tout est géré par le CSS
        panel.innerHTML = `
            <div class="accord-bg"></div>
            <svg class="accord-deco" viewBox="0 0 600 520" xmlns="http://www.w3.org/2000/svg">
                <circle cx="500" cy="80" r="180" fill="none" stroke="var(--pa)" stroke-width="0.7" opacity="0.12"/>
            </svg>
            <span class="accord-num">0${index + 1}</span>
            <div class="accord-label-v">${projet.titre}</div>
            <div class="accord-content">
                <div class="accord-type">${projet.moteur} · ${projet.genre}</div>
                <h3 class="accord-title">${projet.titre}</h3>
                <p class="accord-desc">${projet.description}</p>
                <div class="accord-tags">
                    <span class="accord-tag">${projet.annee}</span>
                    <span class="accord-tag">${projet.lieu}</span>
                    <span class="accord-tag">${projet.moteur}</span>
                    ${projet.customTags ? projet.customTags.map(tag => `<span class="accord-tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="accord-actions">
                    <a href="${projet.lien}" class="btn-accord">
                        Voir le projet →
                    </a>
                </div>
            </div>
        `;
        container.appendChild(panel);
    });

    // Comportement d'ouverture/fermeture
    const panels = document.querySelectorAll('.accord-panel');
    panels.forEach(p => {
        p.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            panels.forEach(p2 => p2.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ============================================================
// 6. GRILLE DES DERNIERS JEUX (Accueil) - AVEC IMAGES DE FOND
// ============================================================
function afficherJeuxRecents(projets) {
    const container = document.getElementById('grid-recents');
    if (!container) return;
    container.innerHTML = '';

    projets.forEach(projet => {
        const card = document.createElement('a');
        card.className = 'perso-card fade-up';
        card.href = projet.lien;

        // 🖼️ On applique l'image en fond
        if (projet.image) {
            card.style.backgroundImage = `url('${projet.image}')`;
        }

        card.innerHTML = `
            <div class="perso-card-header">
                <div class="perso-card-title">${projet.titre}</div>
                <span class="perso-card-year">${projet.annee}</span>
            </div>
            <p class="perso-card-desc">${projet.description}</p>
            <div class="perso-tags">
                <span class="perso-tag">${projet.moteur}</span>
                <span class="perso-tag">${projet.lieu}</span>
                ${projet.customTags ? projet.customTags.map(tag => `<span class="perso-tag">${tag}</span>`).join('') : ''}
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('#grid-recents .fade-up').forEach(el => observer.observe(el));
}

// ============================================================
// 7. GRILLE COMPLÈTE (Page Projets) - AVEC IMAGES DE FOND
// ============================================================
function afficherTousLesJeux(projets) {
    const container = document.getElementById('grid-tous-les-jeux');
    if (!container) return;
    container.innerHTML = '';

    projets.forEach(projet => {
        const card = document.createElement('a');
        card.className = 'perso-card';
        card.href = projet.lien;

        // 🖼️ On applique l'image en fond
        if (projet.image) {
            card.style.backgroundImage = `url('${projet.image}')`;
        }

        card.innerHTML = `
            <div class="perso-card-header">
                <div class="perso-card-title">${projet.titre}</div>
                <span class="perso-card-year">${projet.annee}</span>
            </div>
            <p class="perso-card-desc">${projet.description}</p>
            <div class="perso-tags">
                <span class="perso-tag">${projet.moteur}</span>
                <span class="perso-tag">${projet.lieu}</span>
                <span class="perso-tag">${projet.genre}</span>
                ${projet.customTags ? projet.customTags.map(tag => `<span class="perso-tag">${tag}</span>`).join('') : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================================
// 8. FILTRES (Page Jeux)
// ============================================================
function genererFiltres(projets) {
    const container = document.getElementById('filtres-jeux');
    if (!container) return;

    const annees = [...new Set(projets.map(p => p.annee))].sort((a,b) => b - a);
    const moteurs = [...new Set(projets.map(p => p.moteur))].sort();
    const lieux = [...new Set(projets.map(p => p.lieu))].sort();

    let html = `<button class="filtre-btn active" data-filtre="tous">Tous</button>`;
    
    html += `<div class="filtre-groupe"><span class="filtre-label">Année</span>`;
    annees.forEach(a => html += `<button class="filtre-btn" data-filtre="annee-${a}">${a}</button>`);
    html += `</div>`;

    html += `<div class="filtre-groupe"><span class="filtre-label">Moteur</span>`;
    moteurs.forEach(m => html += `<button class="filtre-btn" data-filtre="moteur-${m}">${m}</button>`);
    html += `</div>`;

    html += `<div class="filtre-groupe"><span class="filtre-label">Lieu</span>`;
    lieux.forEach(l => html += `<button class="filtre-btn" data-filtre="lieu-${l}">${l}</button>`);
    html += `</div>`;

    container.innerHTML = html;

    container.querySelectorAll('.filtre-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.filtre-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtrerJeux(this.dataset.filtre);
        });
    });
}

function filtrerJeux(filtre) {
    if (filtre === 'tous') {
        afficherTousLesJeux(tousLesProjets.filter(p => p.type === 'jeu'));
        return;
    }
    const [type, valeur] = filtre.split('-');
    const jeux = tousLesProjets.filter(p => p.type === 'jeu');
    let resultats = jeux;

    if (type === 'annee') resultats = jeux.filter(p => p.annee === parseInt(valeur));
    else if (type === 'moteur') resultats = jeux.filter(p => p.moteur === valeur);
    else if (type === 'lieu') resultats = jeux.filter(p => p.lieu === valeur);

    afficherTousLesJeux(resultats);
}

// ============================================================
// 9. ART & 3D (Lightbox)
// ============================================================
function afficherArt(oeuvres) {
    const container = document.getElementById('grid-art');
    if (!container) return;
    container.innerHTML = '';

    oeuvres.forEach(oeuvre => {
        const card = document.createElement('div');
        card.className = 'art-card';
        card.innerHTML = `
            <img src="${oeuvre.image || 'img/placeholder.jpg'}" alt="${oeuvre.titre}" loading="lazy">
            <div class="art-card-overlay">
                <span class="art-card-title">${oeuvre.titre}</span>
                <span class="art-card-year">${oeuvre.annee}</span>
            </div>
        `;
        card.addEventListener('click', () => ouvrirLightbox(oeuvre));
        container.appendChild(card);
    });
}

function ouvrirLightbox(oeuvre) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">✕</button>
            <img src="${oeuvre.image || 'img/placeholder.jpg'}" alt="${oeuvre.titre}">
            <h3>${oeuvre.titre}</h3>
            <p>${oeuvre.description || ''}</p>
            <p style="font-size:12px; color:var(--ink3); margin-top:0.5rem;">${oeuvre.moteur} · ${oeuvre.annee}</p>
        </div>
    `;
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('lightbox-close')) {
            this.remove();
        }
    });
}

// ============================================================
// 10. WEBGL SHADER (Rendu)
// ============================================================
const canvas = document.getElementById('shader-bg');
if (canvas) {
    const gl = canvas.getContext('webgl');
    if (gl) {
        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
        const fsSource = `
            precision highp float;
            uniform vec2 iResolution;
            uniform float iTime;
            uniform float uLightMode;

            float DistLine(vec2 p, vec2 a, vec2 b) {
                vec2 ap = p - a;
                vec2 ab = b - a;
                float t = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
                return length(ap - ab * t);
            }

            float N21(vec2 p) {
                p = fract(p * vec2(233.34, 851.73));
                p += dot(p, p+23.45);
                return fract(p.x * p.y);
            }

            vec2 N22(vec2 p) {
                float n = N21(p);
                return vec2(n, N21(p + n));
            }

            vec2 GetPos(vec2 id, vec2 offset) {
                vec2 n = N22(id + offset) * iTime;
                return offset + sin(n) * 0.4;
            }

            float Line(vec2 p, vec2 a, vec2 b) {
                float d = DistLine(p, a, b);
                float m = smoothstep(0.03, 0.01, d);
                m *= smoothstep(1.2, 0.8, length(a - b));
                return m;
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                vec2 uv = (fragCoord - 0.5 * iResolution.xy)/iResolution.y;
                float m = 0.0;
                uv *= 5.0;
                vec2 gv = fract(uv) - 0.5;
                vec2 id = floor(uv);
                
                vec2 p0 = GetPos(id, vec2(-1.0, -1.0));
                vec2 p1 = GetPos(id, vec2( 0.0, -1.0));
                vec2 p2 = GetPos(id, vec2( 1.0, -1.0));
                vec2 p3 = GetPos(id, vec2(-1.0,  0.0));
                vec2 p4 = GetPos(id, vec2( 0.0,  0.0));
                vec2 p5 = GetPos(id, vec2( 1.0,  0.0));
                vec2 p6 = GetPos(id, vec2(-1.0,  1.0));
                vec2 p7 = GetPos(id, vec2( 0.0,  1.0));
                vec2 p8 = GetPos(id, vec2( 1.0,  1.0));
                
                m += Line(gv, p4, p0); m += Line(gv, p4, p1); m += Line(gv, p4, p2);
                m += Line(gv, p4, p3); m += Line(gv, p4, p5); m += Line(gv, p4, p6);
                m += Line(gv, p4, p7); m += Line(gv, p4, p8);
                m += Line(gv, p1, p3); m += Line(gv, p1, p5); m += Line(gv, p7, p3); m += Line(gv, p7, p5);
                
                float t = iTime * 3.5;
                vec2 j;
                j = (p0 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p0.x * 5.0) * 0.5 + 0.5);
                j = (p1 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p1.x * 5.0) * 0.5 + 0.5);
                j = (p2 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p2.x * 5.0) * 0.5 + 0.5);
                j = (p3 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p3.x * 5.0) * 0.5 + 0.5);
                j = (p4 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p4.x * 5.0) * 0.5 + 0.5);
                j = (p5 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p5.x * 5.0) * 0.5 + 0.5);
                j = (p6 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p6.x * 5.0) * 0.5 + 0.5);
                j = (p7 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p7.x * 5.0) * 0.5 + 0.5);
                j = (p8 - gv) * 20.0; m += (0.5 / dot(j, j)) * (sin(t + p8.x * 5.0) * 0.5 + 0.5);
                
                vec3 darkColor = vec3(0.50, 0.46, 0.86);
                vec3 lightColor = vec3(0.15, 0.30, 0.85);
                vec3 current_color = mix(darkColor, lightColor, uLightMode);
                
                vec3 finalDark = m * current_color;
                vec3 finalLight = vec3(0.98, 0.98, 0.97) - m * (vec3(1.0) - current_color);
                
                vec3 col = mix(finalDark, finalLight, uLightMode);
                fragColor = vec4(col, 1.0);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `;

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const positionAttributeLocation = gl.getAttribLocation(program, "position");
        const resolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
        const timeUniformLocation = gl.getUniformLocation(program, "iTime");
        const lightModeUniformLocation = gl.getUniformLocation(program, "uLightMode");

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,   1, -1,  -1,  1,
            -1,  1,   1, -1,   1,  1,
        ]), gl.STATIC_DRAW);

        function resizeCanvas() {
            const displayWidth  = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width  = displayWidth;
                canvas.height = displayHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        }
        window.addEventListener('resize', resizeCanvas);

        let isShaderVisible = true;
        let animationFrameId = null;

        function render(time) {
            if (!isShaderVisible) {
                animationFrameId = null;
                return;
            }
            time *= 0.001;
            resizeCanvas();
            gl.useProgram(program);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform1f(timeUniformLocation, time);
            gl.uniform1f(lightModeUniformLocation, lightModeState);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        }

        const shaderObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const wasVisible = isShaderVisible;
                isShaderVisible = entry.isIntersecting;
                if (isShaderVisible && !wasVisible && !animationFrameId) {
                    animationFrameId = requestAnimationFrame(render);
                }
            });
        }, { threshold: 0.0 });
        shaderObserver.observe(canvas);

        animationFrameId = requestAnimationFrame(render);
    }
}

// ============================================================
// 11. LANCEMENT
// ============================================================
document.addEventListener('DOMContentLoaded', chargerProjets);