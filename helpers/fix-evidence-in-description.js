/**
 * fix-evidence-in-description.js
 * Busca los attachments de cada bug, obtiene su mediaId UUID real,
 * y los agrega al final de la descripción del bug con type:"file" (como PRDTEST-71).
 *
 * Uso: node helpers/fix-evidence-in-description.js PRDTEST-99 PRDTEST-100 ...
 *      node helpers/fix-evidence-in-description.js --all
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
function jiraRequest(method, path_, body) {
    const url = new URL(path_, JIRA_BASE_URL);
    const payload = body ? JSON.stringify(body) : null;
    return new Promise((resolve, reject) => {
        const req = https.request({
            method, hostname: url.hostname, path: url.pathname + (url.search || ''),
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
            },
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data ? JSON.parse(data) : {});
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
                }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
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
                else reject(new Error('UUID no encontrado en: ' + res.headers.location));
            } else {
                reject(new Error(`Se esperaba 303, se obtuvo ${res.statusCode} para attachment ${attachmentId}`));
            }
        });
        req.on('error', reject);
        req.end();
    });
}

// ── Construir nodo mediaSingle con type:file ───────────────────────────────
function mediaNode(uuid) {
    return {
        type: 'mediaSingle',
        attrs: { layout: 'center' },
        content: [{
            type: 'media',
            attrs: { type: 'file', id: uuid, collection: '' }
        }]
    };
}

// ── Procesar un ticket ─────────────────────────────────────────────────────
async function processTicket(ticketKey) {
    console.log(`\n===== ${ticketKey} =====`);

    // 1. Obtener descripción actual e IDs de attachments
    const issue = await jiraRequest('GET', `/rest/api/3/issue/${ticketKey}?fields=description,attachment`);
    const currentDesc = issue.fields.description || { version: 1, type: 'doc', content: [] };
    const attachments = issue.fields.attachment || [];

    if (attachments.length === 0) {
        console.log('  Sin attachments — saltando');
        return;
    }

    // 2. Filtrar solo los attachments de QA (imágenes PNG nuestras, excluyendo el de prueba)
    const qaAttachments = attachments.filter(a =>
        a.mimeType === 'image/png' &&
        a.filename !== 'test-mediaId-check.png' &&
        // Excluir los viejos blob-URL (subidos manualmente antes)
        !a.filename.startsWith('image-2026')
    );

    if (qaAttachments.length === 0) {
        console.log('  Sin attachments QA nuevos — saltando');
        return;
    }

    console.log(`  ${qaAttachments.length} attachment(s) QA encontrados:`);
    qaAttachments.forEach(a => console.log(`    - ${a.filename} (id: ${a.id})`));

    // 3. Obtener UUID de media para cada attachment
    const mediaNodes = [];
    for (const att of qaAttachments) {
        try {
            const uuid = await getMediaUuid(att.id);
            console.log(`    UUID ${att.filename}: ${uuid}`);
            mediaNodes.push(mediaNode(uuid));
        } catch (e) {
            console.warn(`    WARN: no se pudo obtener UUID para ${att.filename}: ${e.message}`);
        }
    }

    if (mediaNodes.length === 0) {
        console.log('  No se pudieron obtener UUIDs — saltando');
        return;
    }

    // 4. Construir nueva descripción: descripción existente + separador + imágenes
    const existingContent = currentDesc.content || [];

    // Evitar duplicar si ya tiene mediaSingle con type:file
    const alreadyHasMedia = existingContent.some(
        n => n.type === 'mediaSingle' && n.content?.[0]?.attrs?.type === 'file'
    );
    if (alreadyHasMedia) {
        console.log('  Ya tiene imágenes type:file en la descripción — saltando');
        return;
    }

    const newContent = [
        ...existingContent,
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: '📸 Evidencia' }] },
        ...mediaNodes,
    ];

    const newDesc = { version: 1, type: 'doc', content: newContent };

    // 5. Actualizar la descripción
    await jiraRequest('PUT', `/rest/api/3/issue/${ticketKey}`, {
        fields: { description: newDesc }
    });
    console.log(`  ✅ Descripción actualizada con ${mediaNodes.length} imagen(es)`);
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
    const args = process.argv.slice(2);
    const ALL_BUGS = ['PRDTEST-99', 'PRDTEST-100', 'PRDTEST-101', 'PRDTEST-102', 'PRDTEST-106', 'PRDTEST-109'];
    const tickets = args.includes('--all') ? ALL_BUGS : args.filter(a => a.startsWith('PRDTEST-'));

    if (tickets.length === 0) {
        console.error('Uso: node helpers/fix-evidence-in-description.js PRDTEST-99 PRDTEST-100 ...');
        console.error('     node helpers/fix-evidence-in-description.js --all');
        process.exit(1);
    }

    for (const ticket of tickets) {
        try {
            await processTicket(ticket);
        } catch (e) {
            console.error(`  ERROR en ${ticket}: ${e.message}`);
        }
    }
    console.log('\nListo.');
})();
