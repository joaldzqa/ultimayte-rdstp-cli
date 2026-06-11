/*
 * gen_report.js â€” Generador unificado de reportes QA
 *
 * Uso:
 *   node gen_report.js --json datos.json
 *   node gen_report.js --json datos.json --ticket PRDTEST-17
 *
 * Mejoras:
 *  - Paths RELATIVOS (funciona aunque muevas la carpeta)
 *  - Lightbox para screenshots
 *  - Filtros por estado/severidad
 *  - BotÃ³n "Copiar como bug Jira"
 *  - Donut chart de cobertura
 *  - Modo oscuro toggle
 *  - Exportar a PDF
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let jsonPath = null, ticketOverride = null;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') jsonPath = args[i + 1];
    if (args[i] === '--ticket') ticketOverride = args[i + 1];
}
if (!jsonPath) {
    console.error('ERROR: --json <archivo.json>');
    process.exit(1);
}

const datos = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
if (ticketOverride) datos.ticket = ticketOverride;

function img64(relPath) {
    if (!relPath) return '';
    try {
        const candidates = [
            path.resolve(path.dirname(jsonPath), relPath),
            path.resolve(__dirname, relPath),
            path.resolve(__dirname, 'evidencia', relPath),
            path.resolve(__dirname, 'evidencia', datos.ticket || '', relPath)
        ];
        for (const c of candidates) {
            if (fs.existsSync(c)) {
                const ext = path.extname(c).slice(1) || 'png';
                return `data:image/${ext};base64,` + fs.readFileSync(c).toString('base64');
            }
        }
        return '';
    } catch { return ''; }
}

const total = (datos.casos || []).length;
const pass = (datos.casos || []).filter(c => c.resultado === 'PASS').length;
const fail = (datos.casos || []).filter(c => c.resultado === 'FAIL').length;
const skip = (datos.casos || []).filter(c => c.resultado === 'SKIP').length;
const bugs = (datos.bugs || []).length;
const bySev = {
    'CrÃ­tica': (datos.bugs || []).filter(b => /crit/i.test(b.severidad || '')).length,
    'Alta': (datos.bugs || []).filter(b => /alta|major/i.test(b.severidad || '')).length,
    'Media': (datos.bugs || []).filter(b => /media|minor/i.test(b.severidad || '')).length,
    'Baja': (datos.bugs || []).filter(b => /baja/i.test(b.severidad || '')).length
};

function bugCard(b, i) {
    const sc = /crit/i.test(b.severidad || '') ? 'critical'
             : /alta|major/i.test(b.severidad || '') ? 'major' : 'minor';
    const tpl = `**TÃ­tulo:** ${b.titulo || ''}\n\n` +
        `**Pasos para reproducir:**\n${(b.pasos || []).map((p, j) => `${j+1}. ${p}`).join('\n')}\n\n` +
        `**Resultado esperado:** ${b.esperado || ''}\n` +
        `**Resultado actual:** ${b.actual || b.descripcion || ''}\n` +
        `**Severidad:** ${b.severidad || ''}\n\n` +
        `**Ambiente:**\n- URL: ${datos.url || ''}\n- Usuario: ${datos.usuario || ''}\n` +
        `- Flujo: ${datos.flujo || datos.modulo || ''}\n- Fecha: ${datos.fecha || ''}\n\n` +
        `**Relacionado:** Bloquea ${datos.ticket || ''}`;
    return `<div class="bug-card ${sc}" data-sev="${sc}">
      <div class="bug-h"><span class="bug-sev ${sc}">${b.severidad || ''}</span>
        <h3>${b.id ? `[${b.id}] ` : ''}${b.titulo || ''}</h3>
        <button class="copy-btn" onclick="copyJira(${i})">ðŸ“‹ Copiar Jira</button></div>
      <p class="bug-desc">${b.descripcion || b.actual || ''}</p>
      ${(Array.isArray(b.evidencia) ? b.evidencia : (b.evidencia ? [b.evidencia] : [])).map(f => { const s = img64(f); return s ? `<img src="${s}" class="thumb" onclick="openLb(this.src)">` : ''; }).join('')}
      <textarea class="jira-tpl" id="jira-${i}" style="display:none">${tpl}</textarea>
    </div>`;
}

function casoCard(c) {
    const e = (c.resultado || '').toUpperCase();
    const cl = e === 'PASS' ? 'pass' : e === 'FAIL' ? 'fail' : 'skip';
    const ps = Array.isArray(c.pasos) ? c.pasos.map(p => `<li>${p}</li>`).join('') : '';
    const evArr = Array.isArray(c.evidencia) ? c.evidencia : (c.evidencia ? [c.evidencia] : []);
    const ev = evArr.map(f => { const s = img64(f); return s ? `<img src="${s}" class="thumb" onclick="openLb(this.src)" title="${f}">` : ''; }).join('');
    return `<div class="caso ${cl}" data-estado="${cl}">
      <div class="caso-h"><span class="badge ${cl}">${e === 'PASS' ? 'âœ… PASS' : e === 'FAIL' ? 'âŒ FAIL' : 'â­ SKIP'}</span>
        <h3>${c.id ? `[${c.id}] ` : ''}${c.nombre || c.titulo || ''}</h3></div>
      <div class="caso-b">
        ${c.objetivo ? `<p><strong>Objetivo:</strong> ${c.objetivo}</p>` : ''}
        ${ps ? `<details open><summary>Pasos</summary><ol>${ps}</ol></details>` : ''}
        ${(c.esperado || c.resultado_esperado) ? `<p><strong>Esperado:</strong> ${c.esperado || c.resultado_esperado}</p>` : ''}
        ${(c.actual || c.resultado_actual) ? `<p><strong>Actual:</strong> ${c.actual || c.resultado_actual}</p>` : ''}
        ${c.notas ? `<div class="notas">${c.notas}</div>` : ''}
        ${ev}
      </div></div>`;
}

const html = `<!DOCTYPE html><html lang="es" data-theme="light"><head><meta charset="UTF-8">
<title>Reporte QA â€” ${datos.ticket || 'qa'}</title><style>
:root{--bg:#f5f5f7;--card:#fff;--text:#1d1d1f;--muted:#6e6e73;--border:#e5e5ea;
--primary:#4a0e8f;--accent:#0066cc;--pass:#28a745;--fail:#dc3545;--skip:#ffc107;
--critical:#d63031;--major:#e17055;--minor:#fdcb6e}
[data-theme="dark"]{--bg:#1c1c1e;--card:#2c2c2e;--text:#f5f5f7;--muted:#98989d;
--border:#38383a;--primary:#bf5af2;--accent:#0a84ff}
*{box-sizing:border-box}
body{font-family:-apple-system,'Segoe UI',Arial,sans-serif;margin:0;background:var(--bg);color:var(--text);transition:all .2s}
.header{background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;padding:32px 40px;position:relative}
.header h1{margin:0 0 8px;font-size:26px}.header p{margin:4px 0;opacity:.95;font-size:14px}
.header-actions{position:absolute;top:24px;right:32px;display:flex;gap:8px}
.btn-icon{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:#fff;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px}
.btn-icon:hover{background:rgba(255,255,255,.3)}
.container{max-width:1200px;margin:32px auto;padding:0 24px}
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.sc{background:var(--card);border-radius:12px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.sc .num{font-size:38px;font-weight:700;line-height:1}
.sc.pass .num{color:var(--pass)}.sc.fail .num{color:var(--fail)}.sc.skip .num{color:var(--skip)}
.sc.bugs .num{color:var(--critical)}.sc.total .num{color:var(--primary)}
.sc p{margin:4px 0 0;font-size:13px;color:var(--muted)}
.chart-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
@media(max-width:768px){.chart-row{grid-template-columns:1fr}}
.chart-card{background:var(--card);border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.chart-card h3{margin:0 0 16px;font-size:14px;color:var(--muted);text-transform:uppercase}
.donut{width:160px;height:160px;margin:0 auto;position:relative}
.donut svg{transform:rotate(-90deg)}.donut circle{fill:none;stroke-width:18}
.donut .bg{stroke:var(--border)}.donut .fg-pass{stroke:var(--pass)}
.donut-label{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
.donut-label .pct{font-size:32px;font-weight:700}.donut-label .lbl{font-size:11px;color:var(--muted)}
.bar-row{margin-bottom:10px}
.bar-label{display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;color:var(--muted)}
.bar-track{height:10px;background:var(--border);border-radius:5px;overflow:hidden}
.bar-fill{height:100%;border-radius:5px}.bar-fill.critical{background:var(--critical)}
.bar-fill.major{background:var(--major)}.bar-fill.minor{background:var(--minor)}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;background:var(--card);border-radius:12px;align-items:center}
.filters strong{font-size:13px;color:var(--muted)}
.filter-btn{background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px}
.filter-btn:hover{border-color:var(--primary)}
.filter-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
.caso,.bug-card{background:var(--card);border-radius:12px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);overflow:hidden}
.caso.hidden,.bug-card.hidden{display:none}
.caso-h{padding:14px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border)}
.caso.pass .caso-h{border-left:4px solid var(--pass)}
.caso.fail .caso-h{border-left:4px solid var(--fail)}
.caso.skip .caso-h{border-left:4px solid var(--skip)}
.caso-b{padding:16px 20px;font-size:14px;line-height:1.6}.caso-b p{margin:8px 0}
.caso-b details summary{cursor:pointer;padding:6px 0;font-weight:500;color:var(--accent)}
.caso-b ol{margin:4px 0 0 16px}
.badge{display:inline-block;padding:4px 12px;border-radius:14px;font-size:11px;font-weight:600}
.badge.pass{background:rgba(40,167,69,.12);color:var(--pass)}
.badge.fail{background:rgba(220,53,69,.12);color:var(--fail)}
.badge.skip{background:rgba(255,193,7,.15);color:#856404}
.caso h3,.bug-card h3{margin:0;font-size:15px;flex:1}
.notas{background:rgba(0,102,204,.06);border-left:3px solid var(--accent);padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;margin:10px 0}
.thumb{max-width:100%;max-height:320px;border:1px solid var(--border);border-radius:8px;margin-top:12px;cursor:zoom-in;display:block}
.bug-card{border-left:4px solid var(--major);padding:16px 20px}
.bug-card.critical{border-left-color:var(--critical)}
.bug-card.minor{border-left-color:var(--minor)}
.bug-h{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.bug-sev{font-size:11px;padding:3px 10px;border-radius:10px;font-weight:600}
.bug-sev.critical{background:rgba(214,48,49,.12);color:var(--critical)}
.bug-sev.major{background:rgba(225,112,85,.12);color:var(--major)}
.bug-sev.minor{background:rgba(253,203,110,.15);color:#856404}
.copy-btn{background:var(--card);border:1px solid var(--border);color:var(--text);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;margin-left:auto}
.copy-btn:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
.copy-btn.copied{background:var(--pass);color:#fff;border-color:var(--pass)}
.bug-desc{margin:8px 0;font-size:14px}
.section-title{font-size:18px;margin:28px 0 14px}
.lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;align-items:center;justify-content:center;cursor:zoom-out;padding:24px}
.lightbox.open{display:flex}.lightbox img{max-width:100%;max-height:100%;border-radius:8px}
.lightbox-close{position:absolute;top:16px;right:24px;color:#fff;font-size:32px;cursor:pointer;background:none;border:none}
.footer{text-align:center;padding:30px;font-size:12px;color:var(--muted)}
@media print{.header-actions,.filters,.copy-btn,.lightbox{display:none!important}
.caso,.bug-card{break-inside:avoid;box-shadow:none;border:1px solid #ddd}}
</style></head><body>
<div class="header">
<div class="header-actions">
<button class="btn-icon" onclick="toggleTheme()">ðŸŒ— Tema</button>
<button class="btn-icon" onclick="window.print()">ðŸ–¨ PDF</button></div>
<h1>Reporte QA â€” ${datos.ticket || 'qa'}</h1>
${datos.hu ? `<p><strong>HU:</strong> ${datos.hu}</p>` : ''}
<p><strong>Fecha:</strong> ${datos.fecha || ''}
${datos.usuario ? `&nbsp;|&nbsp; <strong>Usuario:</strong> ${datos.usuario}` : ''}
${datos.flujo ? `&nbsp;|&nbsp; <strong>Flujo:</strong> ${datos.flujo}` : ''}
${datos.modulo ? `&nbsp;|&nbsp; <strong>MÃ³dulo:</strong> ${datos.modulo}` : ''}</p></div>
<div class="container">
<div class="summary">
<div class="sc total"><div class="num">${total}</div><p>Total casos</p></div>
<div class="sc pass"><div class="num">${pass}</div><p>âœ… PASS</p></div>
<div class="sc fail"><div class="num">${fail}</div><p>âŒ FAIL</p></div>
${skip ? `<div class="sc skip"><div class="num">${skip}</div><p>â­ SKIP</p></div>` : ''}
<div class="sc bugs"><div class="num">${bugs}</div><p>ðŸ› Bugs</p></div></div>
<div class="chart-row">
<div class="chart-card"><h3>Cobertura</h3><div class="donut">
<svg width="160" height="160" viewBox="0 0 160 160">
<circle class="bg" cx="80" cy="80" r="65"/>
<circle class="fg-pass" cx="80" cy="80" r="65" stroke-dasharray="${total > 0 ? (pass / total * 408.4).toFixed(1) : 0} 408.4"/>
</svg><div class="donut-label">
<div class="pct">${total > 0 ? Math.round(pass / total * 100) : 0}%</div><div class="lbl">PASS</div>
</div></div></div>
<div class="chart-card"><h3>Bugs por severidad</h3>
${Object.entries(bySev).filter(([_, n]) => n > 0).map(([s, n]) => {
const cl = s === 'CrÃ­tica' ? 'critical' : s === 'Alta' ? 'major' : 'minor';
const m = Math.max(...Object.values(bySev), 1);
return `<div class="bar-row"><div class="bar-label"><span>${s}</span><span>${n}</span></div>
<div class="bar-track"><div class="bar-fill ${cl}" style="width:${(n/m*100).toFixed(0)}%"></div></div></div>`;
}).join('') || '<p style="text-align:center;color:var(--muted);margin:30px 0">Sin bugs ðŸŽ‰</p>'}
</div></div>
<div class="filters"><strong>Filtrar casos:</strong>
<button class="filter-btn active" onclick="fltC('all')">Todos</button>
<button class="filter-btn" onclick="fltC('pass')">âœ… PASS</button>
<button class="filter-btn" onclick="fltC('fail')">âŒ FAIL</button></div>
<h2 class="section-title">Casos de prueba</h2>
${(datos.casos || []).map(c => casoCard(c)).join('')}
${bugs > 0 ? `<h2 class="section-title">ðŸ› Bugs (${bugs})</h2>
<div class="filters"><strong>Filtrar bugs:</strong>
<button class="filter-btn active" onclick="fltB('all')">Todos</button>
<button class="filter-btn" onclick="fltB('critical')">ðŸ”´ CrÃ­ticos</button>
<button class="filter-btn" onclick="fltB('major')">ðŸŸ  Mayores</button>
<button class="filter-btn" onclick="fltB('minor')">ðŸŸ¡ Menores</button></div>
${(datos.bugs || []).map((b, i) => bugCard(b, i)).join('')}` : ''}
</div>
<div class="lightbox" onclick="closeLb()"><button class="lightbox-close" onclick="closeLb()">âœ•</button>
<img id="lb-img" alt=""></div>
<div class="footer">Generado Â· ${new Date().toLocaleString('es-CO')}</div>
<script>
function toggleTheme(){const h=document.documentElement;const n=h.dataset.theme==='light'?'dark':'light';h.dataset.theme=n;localStorage.setItem('theme',n)}
const st=localStorage.getItem('theme');if(st)document.documentElement.dataset.theme=st;
function fltC(e){document.querySelectorAll('.filters:first-of-type .filter-btn').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');document.querySelectorAll('.caso').forEach(c=>{c.classList.toggle('hidden',e!=='all'&&c.dataset.estado!==e)})}
function fltB(s){const f=document.querySelectorAll('.filters');f[f.length-1].querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');document.querySelectorAll('.bug-card').forEach(c=>{c.classList.toggle('hidden',s!=='all'&&c.dataset.sev!==s)})}
function openLb(s){document.getElementById('lb-img').src=s;document.querySelector('.lightbox').classList.add('open')}
function closeLb(){document.querySelector('.lightbox').classList.remove('open')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb()});
function copyJira(i){const t=document.getElementById('jira-'+i).value;navigator.clipboard.writeText(t).then(()=>{const b=event.target;const o=b.innerHTML;b.innerHTML='âœ“ Copiado';b.classList.add('copied');setTimeout(()=>{b.innerHTML=o;b.classList.remove('copied')},1800)})}
</script></body></html>`;

const fecha = datos.fecha || new Date().toISOString().slice(0, 10);
const outDir = path.join(__dirname, 'reportes', fecha);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${datos.ticket || 'qa'}.html`);
fs.writeFileSync(outFile, html, 'utf8');
console.log(`OK ${outFile}`);
console.log(`   ${total} casos: ${pass} PASS, ${fail} FAIL${skip ? `, ${skip} SKIP` : ''}, ${bugs} bugs`);

// Regenera el indice automaticamente (reemplaza al hook post-test.ps1 que nunca funciono)
try {
  if (fs.existsSync(path.join(__dirname, 'gen_index.js'))) {
    require('child_process').execSync('node gen_index.js', { cwd: __dirname, stdio: 'inherit' });
  }
} catch (e) {
  console.warn(`AVISO: no se pudo regenerar el indice: ${e.message}`);
}
