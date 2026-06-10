const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'reportes');
if (!fs.existsSync(dir)) { console.error('No existe reportes/'); process.exit(1); }
const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => {
        const s = fs.statSync(path.join(dir, f));
        const m = f.match(/^(reporte|compare|regresion)-(.+?)-(\d{4}-\d{2}-\d{2})/);
        return { file: f,
                 tipo: m ? m[1] : 'otro',
                 ticket: m ? m[2] : f.replace('.html',''),
                 fecha: m ? m[3] : s.mtime.toISOString().slice(0,10),
                 mtime: s.mtime, size: (s.size/1024).toFixed(0) };
    })
    .sort((a, b) => b.mtime - a.mtime);

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Ãndice Reportes QA</title><style>
body{font-family:-apple-system,'Segoe UI',Arial,sans-serif;margin:0;background:#f5f5f7;color:#1d1d1f}
.header{background:linear-gradient(135deg,#4a0e8f,#0066cc);color:#fff;padding:32px 40px}
.header h1{margin:0;font-size:26px}.header p{margin:6px 0 0;opacity:.9;font-size:14px}
.container{max-width:1100px;margin:32px auto;padding:0 24px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat{background:#fff;padding:20px;border-radius:12px;text-align:center}
.stat .num{font-size:36px;font-weight:700;color:#4a0e8f}.stat p{margin:4px 0 0;color:#6e6e73;font-size:13px}
.search{width:100%;padding:12px 16px;border:1px solid #e5e5ea;border-radius:12px;font-size:14px;margin-bottom:16px;background:#fff}
.list{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.item{display:grid;grid-template-columns:auto 1fr auto auto auto;gap:16px;padding:14px 20px;border-bottom:1px solid #e5e5ea;align-items:center;text-decoration:none;color:inherit}
.item:hover{background:#f5f5f7}.item:last-child{border-bottom:none}
.item .icon{font-size:24px}.item .title{font-weight:500;font-size:15px}
.item .meta{color:#6e6e73;font-size:12px;margin-top:2px}
.item .date{color:#6e6e73;font-size:12px}.item .arrow{color:#4a0e8f}
.tipo{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:600;text-transform:uppercase}
.tipo.reporte{background:#e0f0ff;color:#0066cc}
.tipo.compare{background:#fff3e0;color:#e17055}
.tipo.regresion{background:#f0e6ff;color:#4a0e8f}
.footer{text-align:center;padding:30px;font-size:12px;color:#6e6e73}
</style></head><body>
<div class="header"><h1>ðŸ“Š Ãndice de Reportes QA</h1>
<p>qa-prdtest Â· ${files.length} reportes</p></div>
<div class="container">
<div class="stats">
<div class="stat"><div class="num">${files.length}</div><p>Total</p></div>
<div class="stat"><div class="num">${files.filter(f=>f.tipo==='reporte').length}</div><p>Reportes</p></div>
<div class="stat"><div class="num">${files.filter(f=>f.tipo==='compare').length}</div><p>Comparativas</p></div>
<div class="stat"><div class="num">${files.length > 0 ? files[0].fecha : 'â€”'}</div><p>Ãšltimo</p></div>
</div>
<input type="text" class="search" placeholder="ðŸ” Buscar..." oninput="flt(this.value)">
<div class="list">
${files.map(f => {
    const icon = f.tipo==='compare'?'ðŸ”':f.tipo==='regresion'?'ðŸ”':'ðŸ“„';
    return `<a href="${f.file}" class="item" data-s="${f.ticket.toLowerCase()} ${f.fecha} ${f.tipo}">
<div class="icon">${icon}</div>
<div><div class="title">${f.ticket}</div><div class="meta">${f.file} Â· ${f.size} KB</div></div>
<div class="tipo ${f.tipo}">${f.tipo}</div>
<div class="date">${f.fecha}</div><div class="arrow">â†’</div></a>`;
}).join('')}
</div></div>
<div class="footer">Generado Â· ${new Date().toLocaleString('es-CO')}</div>
<script>function flt(q){q=q.toLowerCase();document.querySelectorAll('.item').forEach(i=>{i.style.display=i.dataset.s.includes(q)?'grid':'none'})}</script>
</body></html>`;

fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
console.log(`OK reportes/index.html con ${files.length} reportes`);
