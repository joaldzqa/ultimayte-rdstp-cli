/*
 * gen_compare.js â€” Comparador visual de screenshots
 *
 * Compara screenshots actuales con los de baseline para detectar cambios visuales.
 * Ãštil para regresiÃ³n: si un botÃ³n se moviÃ³ o cambiÃ³ de color, lo detecta.
 *
 * Uso:
 *   node gen_compare.js                              # compara evidencia/regresion vs evidencia/baseline
 *   node gen_compare.js --current evidencia/PRDTEST-22 --baseline evidencia/baseline
 *
 * Output: reportes/compare-[YYYY-MM-DD].html con vista lado-a-lado
 *
 * Nota: no hace anÃ¡lisis pixel-por-pixel (eso requiere instalar pixelmatch).
 * Hace comparaciÃ³n VISUAL lado-a-lado para que TÃš veas los cambios.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let currentDir = path.join(__dirname, 'evidencia', 'regresion');
let baselineDir = path.join(__dirname, 'evidencia', 'baseline');

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--current') currentDir = path.resolve(__dirname, args[i + 1]);
    if (args[i] === '--baseline') baselineDir = path.resolve(__dirname, args[i + 1]);
}

function img64(p) {
    if (!fs.existsSync(p)) return '';
    return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
}

function getPng(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
}

const baseline = getPng(baselineDir);
const current = getPng(currentDir);

if (baseline.length === 0) {
    console.log('âš ï¸ No hay baseline. Crea una con:');
    console.log(`   cp evidencia/regresion/*.png evidencia/baseline/`);
    console.log('   (En PowerShell: Copy-Item evidencia/regresion/*.png evidencia/baseline/)');
    process.exit(0);
}

// Empareja por nombre
const pairs = [];
const onlyInBaseline = [];
const onlyInCurrent = [];

for (const f of baseline) {
    if (current.includes(f)) {
        pairs.push({ name: f, baseline: path.join(baselineDir, f), current: path.join(currentDir, f) });
    } else {
        onlyInBaseline.push(f);
    }
}
for (const f of current) {
    if (!baseline.includes(f)) onlyInCurrent.push(f);
}

const html = `<!DOCTYPE html><html lang="es" data-theme="light"><head><meta charset="UTF-8">
<title>Comparador Visual</title><style>
:root{--bg:#f5f5f7;--card:#fff;--text:#1d1d1f;--muted:#6e6e73;--border:#e5e5ea;--primary:#4a0e8f;--accent:#0066cc}
[data-theme="dark"]{--bg:#1c1c1e;--card:#2c2c2e;--text:#f5f5f7;--muted:#98989d;--border:#38383a}
*{box-sizing:border-box}
body{font-family:-apple-system,'Segoe UI',Arial,sans-serif;margin:0;background:var(--bg);color:var(--text)}
.header{background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;padding:32px 40px}
.header h1{margin:0;font-size:24px}.header p{margin:6px 0 0;opacity:.9;font-size:14px}
.container{max-width:1400px;margin:32px auto;padding:0 24px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.stat{background:var(--card);padding:20px;border-radius:12px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.stat .num{font-size:36px;font-weight:700;color:var(--primary)}
.stat p{margin:4px 0 0;color:var(--muted);font-size:13px}
.pair{background:var(--card);border-radius:12px;margin-bottom:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.pair-h{padding:14px 20px;border-bottom:1px solid var(--border);font-weight:500;font-size:15px;display:flex;align-items:center;gap:12px}
.pair-h .name{flex:1;font-family:monospace;font-size:13px;color:var(--muted)}
.pair-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border)}
.side{padding:16px;background:var(--card)}
.side h4{margin:0 0 12px;font-size:12px;text-transform:uppercase;color:var(--muted);letter-spacing:.5px}
.side img{max-width:100%;border:1px solid var(--border);border-radius:6px;cursor:zoom-in;display:block}
.alert{background:#fff3cd;border-left:4px solid #ffc107;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:16px}
.alert.success{background:#d4edda;border-color:#28a745;color:#155724}
.alert.danger{background:#f8d7da;border-color:#dc3545;color:#721c24}
.lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;align-items:center;justify-content:center;cursor:zoom-out;padding:24px}
.lightbox.open{display:flex}.lightbox img{max-width:100%;max-height:100%;border-radius:8px}
.lightbox-close{position:absolute;top:16px;right:24px;color:#fff;font-size:32px;cursor:pointer;background:none;border:none}
.list-only{background:var(--card);padding:16px 20px;border-radius:12px;margin-bottom:16px}
.list-only h3{margin:0 0 8px;font-size:14px;color:var(--muted)}
.list-only ul{margin:0;padding-left:20px;font-family:monospace;font-size:12px}
</style></head><body>
<div class="header">
<h1>ðŸ” Comparador Visual de Screenshots</h1>
<p>Compara baseline vs actual para detectar cambios visuales</p></div>
<div class="container">
<div class="stats">
<div class="stat"><div class="num">${pairs.length}</div><p>Pares comparados</p></div>
<div class="stat"><div class="num">${onlyInBaseline.length}</div><p>Solo en baseline (faltan)</p></div>
<div class="stat"><div class="num">${onlyInCurrent.length}</div><p>Solo en actual (nuevos)</p></div>
</div>
${pairs.length === 0 ? '<div class="alert danger">No hay pares para comparar. Verifica que ambas carpetas tengan archivos con los mismos nombres.</div>' : ''}
${onlyInBaseline.length > 0 ? `<div class="list-only"><h3>ðŸ“‹ Screenshots faltantes en actual (estaban en baseline):</h3>
<ul>${onlyInBaseline.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}
${onlyInCurrent.length > 0 ? `<div class="list-only"><h3>ðŸ†• Screenshots nuevos en actual (no estaban en baseline):</h3>
<ul>${onlyInCurrent.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}
${pairs.map(p => `
<div class="pair">
<div class="pair-h"><span class="name">${p.name}</span></div>
<div class="pair-grid">
<div class="side"><h4>ðŸ“… Baseline</h4><img src="${img64(p.baseline)}" onclick="openLb(this.src)"></div>
<div class="side"><h4>ðŸ†• Actual</h4><img src="${img64(p.current)}" onclick="openLb(this.src)"></div>
</div></div>`).join('')}
</div>
<div class="lightbox" onclick="closeLb()"><button class="lightbox-close" onclick="closeLb()">âœ•</button>
<img id="lb-img" alt=""></div>
<script>
function openLb(s){document.getElementById('lb-img').src=s;document.querySelector('.lightbox').classList.add('open')}
function closeLb(){document.querySelector('.lightbox').classList.remove('open')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb()});
</script></body></html>`;

const outDir = path.join(__dirname, 'reportes');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const fecha = new Date().toISOString().slice(0, 10);
const outFile = path.join(outDir, `compare-${fecha}.html`);
fs.writeFileSync(outFile, html, 'utf8');

console.log(`OK ${outFile}`);
console.log(`   Pares comparados: ${pairs.length}`);
console.log(`   Solo en baseline (faltan en actual): ${onlyInBaseline.length}`);
console.log(`   Solo en actual (nuevos): ${onlyInCurrent.length}`);
console.log('');
console.log('Abre el HTML para ver las imÃ¡genes lado-a-lado.');
