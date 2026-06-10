/**
 * add-evidence-comment.js — Sube screenshots a Jira y los embebe en la DESCRIPCIÓN del ticket
 * Usa type:"file" con el mediaId UUID real (igual que PRDTEST-71) para que las imágenes
 * se vean en tamaño completo y sean clicables.
 *
 * Uso:
 *   node helpers/add-evidence-comment.js PRDTEST-123 --tipo bug --screenshots img1.png img2.png
 *   node helpers/add-evidence-comment.js PRDTEST-123 --tipo aprobacion --ticket PRDTEST-67 --screenshots img1.png
 *   node helpers/add-evidence-comment.js PRDTEST-123 --solo-comentario --screenshots img1.png  (solo agrega comentario)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
}
loadEnv();

const { JIRA_API_TOKEN, JIRA_EMAIL, JIRA_BASE_URL } = process.env;
const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

// ── Request helper ─────────────────────────────────────────────────────────
function request(method, urlPath, body) {
    const url = new URL(urlPath, JIRA_BASE_URL);
    const payload = body ? JSON.stringify(body) : null;
    return new Promise((resolve, reject) => {
        const req = https.request({
            method, hostname: url.hostname, path: url.pathname,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
            },
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) resolve(data ? JSON.parse(data) : {});
                else reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

// ── Subir adjunto ──────────────────────────────────────────────────────────
function uploadAttachment(ticketKey, filePath) {
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const boundary = '----FormBoundary' + Date.now();
    const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`);
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileData, footer]);
    const url = new URL(`/rest/api/3/issue/${ticketKey}/attachments`, JIRA_BASE_URL);

    return new Promise((resolve, reject) => {
        const req = https.request({
            method: 'POST', hostname: url.hostname, path: url.pathname,
            headers: {
                'Authorization': `Basic ${auth}`,
                'X-Atlassian-Token': 'no-check',
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
            },
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const r = JSON.parse(data)[0];
                    console.log(`  UP  ${fileName} (id: ${r.id})`);
                    resolve({ id: r.id, filename: r.filename });
                } else reject(new Error(`${res.statusCode}: ${data}`));
            });
        });
        req.on('error', reject);
        req.write(body); req.end();
    });
}

// ── Obtener UUID de media siguiendo el redirect ────────────────────────────
function getMediaUuid(attachmentId) {
    const url = new URL(`/rest/api/3/attachment/content/${attachmentId}`, JIRA_BASE_URL);
    return new Promise((resolve, reject) => {
        const req = https.request({
            method: 'GET', hostname: url.hostname, path: url.pathname,
            headers: { 'Authorization': `Basic ${auth}` },
        }, (res) => {
            res.resume();
            if (res.statusCode === 303 && res.headers.location) {
                const match = res.headers.location.match(/\/file\/([a-f0-9-]{36})\/binary/);
                if (match) resolve(match[1]);
                else reject(new Error('UUID no encontrado en redirect'));
            } else {
                reject(new Error(`Expected 303, got ${res.statusCode}`));
            }
        });
        req.on('error', reject);
        req.end();
    });
}

// ── Nodo ADF media (type:file con UUID real) ───────────────────────────────
function mediaNode(uuid) {
    return {
        type: 'mediaSingle',
        attrs: { layout: 'center' },
        content: [{ type: 'media', attrs: { type: 'file', id: uuid, collection: '' } }]
    };
}

// ── Agregar imágenes a la descripción del ticket ───────────────────────────
async function addImagesToDescription(ticketKey, mediaNodes) {
    const issue = await request('GET', `/rest/api/3/issue/${ticketKey}?fields=description`);
    const currentDesc = issue.fields.description || { version: 1, type: 'doc', content: [] };
    const existingContent = currentDesc.content || [];

    const newContent = [
        ...existingContent,
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: '📸 Evidencia' }] },
        ...mediaNodes,
    ];

    await request('PUT', `/rest/api/3/issue/${ticketKey}`, {
        fields: { description: { version: 1, type: 'doc', content: newContent } }
    });
    console.log(`  OK  Imágenes agregadas a la descripción de ${ticketKey}`);
}

// ── Publicar comentario ADF con tabla de casos (aprobacion) ───────────────
function buildAprobacionComment({ ticketRef, casos, mediaNodes, fecha }) {
    const tableRows = [
        {
            type: 'tableRow',
            content: ['Caso de Prueba', 'Resultado', 'Observación'].map(h => ({
                type: 'tableHeader', attrs: {}, content: [{ type: 'paragraph', content: [{ type: 'text', text: h, marks: [{ type: 'strong' }] }] }]
            }))
        },
        ...(casos || []).map(c => ({
            type: 'tableRow',
            content: [
                { type: 'tableCell', attrs: {}, content: [{ type: 'paragraph', content: [{ type: 'text', text: c.id + ' — ' + c.nombre }] }] },
                { type: 'tableCell', attrs: {}, content: [{ type: 'paragraph', content: [{ type: 'text', text: c.resultado === 'PASS' ? '✅ PASS' : '❌ FAIL' }] }] },
                { type: 'tableCell', attrs: {}, content: [{ type: 'paragraph', content: [{ type: 'text', text: c.actual || '' }] }] },
            ]
        }))
    ];

    return {
        version: 1, type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: `✅ Evidencia QA — ${ticketRef}` }] },
            { type: 'paragraph', content: [{ type: 'text', text: `Fecha: ${fecha} | Ejecutado por: ${JIRA_EMAIL}` }] },
            { type: 'table', attrs: { isNumberColumnEnabled: false, layout: 'default' }, content: tableRows },
            { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: '📸 Screenshots' }] },
            ...mediaNodes,
        ]
    };
}

function addComment(ticketKey, adfBody) {
    const payload = JSON.stringify({ body: adfBody });
    const url = new URL(`/rest/api/3/issue/${ticketKey}/comment`, JIRA_BASE_URL);
    return new Promise((resolve, reject) => {
        const req = https.request({
            method: 'POST', hostname: url.hostname, path: url.pathname,
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 201) resolve(JSON.parse(data));
                else reject(new Error(`${res.statusCode}: ${data}`));
            });
        });
        req.on('error', reject);
        req.write(payload); req.end();
    });
}

// ── CLI ────────────────────────────────────────────────────────────────────
(async () => {
    const args = process.argv.slice(2);
    const ticketKey = args[0];
    const tipo = args[args.indexOf('--tipo') + 1] || 'bug';
    const ticketRef = args[args.indexOf('--ticket') + 1] || ticketKey;
    const soloComentario = args.includes('--solo-comentario');
    const ssIdx = args.indexOf('--screenshots');
    const screenshots = ssIdx >= 0 ? args.slice(ssIdx + 1) : [];

    if (!ticketKey || screenshots.length === 0) {
        console.error('Uso: node helpers/add-evidence-comment.js PRDTEST-123 --tipo bug|aprobacion --screenshots img1.png ...');
        process.exit(1);
    }

    const fecha = new Date().toISOString().slice(0, 10);

    // Leer casos del JSON de resultados si existe (para tipo aprobacion)
    let casos = [];
    const jsonPath = path.join(__dirname, '..', 'evidencia', ticketRef, 'resultado.json');
    if (fs.existsSync(jsonPath)) {
        casos = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).casos || [];
    }

    console.log(`Subiendo ${screenshots.length} screenshot(s) a ${ticketKey}...`);
    const attachments = [];
    for (const ss of screenshots) {
        if (!fs.existsSync(ss)) { console.warn(`  SKIP ${ss} (no encontrado)`); continue; }
        attachments.push(await uploadAttachment(ticketKey, ss));
    }

    // Obtener UUIDs de media para type:file (igual que PRDTEST-71)
    console.log('Obteniendo media UUIDs...');
    const nodes = [];
    for (const att of attachments) {
        try {
            const uuid = await getMediaUuid(att.id);
            console.log(`  UUID ${att.filename}: ${uuid}`);
            nodes.push(mediaNode(uuid));
        } catch (e) {
            console.warn(`  WARN: sin UUID para ${att.filename} — ${e.message}`);
        }
    }

    if (nodes.length === 0) {
        console.error('No se pudieron obtener UUIDs. Abortando.');
        process.exit(1);
    }

    if (tipo === 'bug' && !soloComentario) {
        // Para bugs: agregar imágenes directamente en la descripción
        console.log('Agregando imágenes a la descripción del bug...');
        await addImagesToDescription(ticketKey, nodes);
    } else if (tipo === 'aprobacion') {
        // Para aprobaciones: comentario con tabla de resultados + imágenes
        console.log('Publicando comentario de aprobación...');
        const adf = buildAprobacionComment({ ticketRef, casos, mediaNodes: nodes, fecha });
        await addComment(ticketKey, adf);
        console.log(`OK  Comentario de aprobación publicado en ${ticketKey}`);
    } else {
        // --solo-comentario: agrega comentario simple con imágenes
        console.log('Publicando comentario con evidencia...');
        const adf = {
            version: 1, type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🐛 Evidencia del Bug' }] },
                { type: 'paragraph', content: [{ type: 'text', text: `Fecha: ${fecha} | QA: ${JIRA_EMAIL}` }] },
                ...nodes,
            ]
        };
        await addComment(ticketKey, adf);
        console.log(`OK  Comentario publicado en ${ticketKey}`);
    }
})();
