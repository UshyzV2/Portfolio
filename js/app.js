const html = document.documentElement;
let saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

// Check Thème WebGL (1.0 = light, 0.0 = dark)
let lightModeState = saved === 'light' ? 1.0 : 0.0;
    
document.getElementById('themeToggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    
    // Update Variable de contrôle du thème WEBGL
    lightModeState = next === 'light' ? 1.0 : 0.0;
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


/* RENDU WEBGL */

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

        // Variables de contrôle pour la mise en veille
        let isShaderVisible = true;
        let animationFrameId = null;

        function render(time) {
            // SI LE SHADER N'EST PAS VISIBLE, ON COUPE LA BOUCLE ICI (ÉCONOMIE GPU)
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

        // Détecteur optique : Met le shader en pause quand il sort de l'écran
        const shaderObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const wasVisible = isShaderVisible;
                isShaderVisible = entry.isIntersecting;

                // Si le shader redevient visible et que la boucle était arrêtée, on la relance
                if (isShaderVisible && !wasVisible && !animationFrameId) {
                    animationFrameId = requestAnimationFrame(render);
                }
            });
        }, { threshold: 0.0 }); // Déclenchement dès le premier pixel invisible

        shaderObserver.observe(canvas);

        // Lancement initial
        animationFrameId = requestAnimationFrame(render);
    }
}