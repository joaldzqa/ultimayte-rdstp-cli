/**
 * upload-attachment.js — Sube screenshots a Jira y devuelve datos para embedding
 * Sin dependencias externas — solo Node.js built-ins
 *
 * Uso:
 *   node helpers/upload-attachment.js PRDTEST-123 img1.png img2.png
 *   node helpers/upload-attachment.js PRDTEST-123 img1.png --json   ← devuelve JSON con IDs
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

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const filePaths = args.filter(a => !a.startsWith('--') && a !== args[0]);
const ticketKey = args[0];

if (!ticketKey || filePaths.length === 0) {
    console.error('Uso: node helpers/upload-attachment.js PRDTEST-123 archivo1.png [archivo2.png] [--json]');
    process.exit(1);
}

const { JIRA_API_TOKEN, JIRA_EMAIL, JIRA_BASE_URL } = process.env;

if (!JIRA_API_TOKEN || !JIRA_EMAIL || !JIRA_BASE_URL) {
    console.error('ERROR: Faltan variables en .env (JIRA_API_TOKEN, JIRA_EMAIL, JIRA_BASE_URL)');
    process.exit(1);
}

function uploadFile(filePath) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(filePath);
        const fileData = fs.readFileSync(filePath);
        const boundary = '----FormBoundary' + Date.now();

        const header = Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`
        );
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
        const body = Buffer.concat([header, fileData, footer]);

        const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
        const url = new URL(`/rest/api/3/issue/${ticketKey}/attachments`, JIRA_BASE_URL);

        const req = https.request({
            method: 'POST',
            hostname: url.hostname,
            path: url.pathname,
            headers: {
                'Authorization': `Basic ${auth}`,
                'X-Atlassian-Token': 'no-check',
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
            },
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(data)[0];
                    if (!jsonMode) console.log(`OK  ${fileName} → id:${result.id}`);
                    resolve({
                        id: result.id,
                        filename: result.filename,
                        contentUrl: result.content,
                        thumbnailUrl: result.thumbnail,
                    });
                } else {
                    console.error(`ERROR ${res.statusCode}: ${data}`);
                    reject(new Error(data));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

(async () => {
    if (!jsonMode) console.log(`Subiendo ${filePaths.length} archivo(s) a ${ticketKey}...`);
    const results = [];
    for (const fp of filePaths) {
        if (!fs.existsSync(fp)) { console.warn(`SKIP ${fp} (no encontrado)`); continue; }
        const r = await uploadFile(fp);
        results.push(r);
    }
    if (jsonMode) {
        process.stdout.write(JSON.stringify(results, null, 2));
    } else {
        console.log(`Listo. ${results.length} archivo(s) subidos.`);
    }
})();
