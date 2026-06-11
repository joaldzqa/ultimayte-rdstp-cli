const https = require('https');
const fs = require('fs');
const path = require('path');

const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://tbtbglobaltest.atlassian.net';

if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('ERROR: JIRA_EMAIL o JIRA_API_TOKEN no están definidos en process.env');
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

function apiRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, JIRA_BASE_URL);
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      method, hostname: url.hostname, path: url.pathname + url.search,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        ...(bodyStr ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        } else {
          reject(new Error(`${method} ${urlPath} → ${res.statusCode}: ${data.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function uploadAttachment(ticketKey, filePath) {
  const fileName = path.basename(filePath);
  const fileData = fs.readFileSync(filePath);
  const boundary = `----FormBoundary${Date.now()}`;
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
        'Content-Length': body.length
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          resolve(Array.isArray(parsed) ? parsed[0] : parsed);
        } else {
          reject(new Error(`Upload ${fileName} → ${res.statusCode}: ${data.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getMediaUuid(attachmentId) {
  const url = new URL(`/rest/api/3/attachment/content/${attachmentId}`, JIRA_BASE_URL);
  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'GET', hostname: url.hostname, path: url.pathname,
      headers: { 'Authorization': `Basic ${auth}` }
    }, res => {
      res.resume();
      if (res.statusCode === 303 && res.headers.location) {
        const match = res.headers.location.match(/\/file\/([a-f0-9-]{36})\/binary/);
        if (match) resolve(match[1]);
        else reject(new Error(`UUID no encontrado en: ${res.headers.location}`));
      } else {
        reject(new Error(`Expected 303, got ${res.statusCode}`));
      }
    });
    req.on('error', reject);
    req.end();
  });
}

async function processTicket(ticketKey, commentId, imagePaths) {
  console.log(`\n=== ${ticketKey} (comentario ${commentId}) ===`);

  // Obtener ADF actual del comentario
  const comment = await apiRequest('GET', `/rest/api/3/issue/${ticketKey}/comment/${commentId}`);
  const currentAdf = comment.body;

  // Subir imágenes y obtener UUIDs
  const mediaNodes = [];
  for (const imgPath of imagePaths) {
    if (!fs.existsSync(imgPath)) { console.log(`  SKIP (no existe): ${imgPath}`); continue; }
    const fileName = path.basename(imgPath);
    process.stdout.write(`  Subiendo ${fileName}... `);
    const att = await uploadAttachment(ticketKey, imgPath);
    const uuid = await getMediaUuid(att.id);
    console.log(`OK (id=${att.id}, uuid=${uuid.slice(0,8)}...)`);
    mediaNodes.push({
      type: 'mediaSingle',
      attrs: { layout: 'center' },
      content: [{ type: 'media', attrs: { type: 'file', id: uuid, collection: '' } }]
    });
  }

  if (mediaNodes.length === 0) { console.log('  Sin imágenes nuevas.'); return; }

  // Actualizar comentario con imágenes adjuntas
  const updatedAdf = { version: 1, type: 'doc', content: [...currentAdf.content, ...mediaNodes] };
  await apiRequest('PUT', `/rest/api/3/issue/${ticketKey}/comment/${commentId}`, { body: updatedAdf });
  console.log(`  ✅ Comentario actualizado con ${mediaNodes.length} imágenes.`);
}

async function main() {
  const base = 'c:/ultimate/evidencia';
  await processTicket('RDSTP-763', '38445', [
    `${base}/RDSTP-763/01-app-baseline-past-treatment.png`,
    `${base}/RDSTP-763/02-connect-baseline-past-treatment.png`,
    `${base}/RDSTP-763/03-app-ert-date-fields-required.png`,
    `${base}/RDSTP-763/04-app-ert-calendar-open.png`,
    `${base}/RDSTP-763/05-app-ert-calendar-future-allowed.png`,
  ]);
  await processTicket('RDSTP-812', '38446', [
    `${base}/RDSTP-812/01-app-ert-labels-correct.png`,
    `${base}/RDSTP-812/02-connect-ert-labels-correct.png`,
  ]);
  console.log('\n✅ Listo. Verifica en Jira que las imágenes aparezcan en los comentarios.');
}

main().catch(err => { console.error('\nERROR:', err.message); process.exit(1); });
