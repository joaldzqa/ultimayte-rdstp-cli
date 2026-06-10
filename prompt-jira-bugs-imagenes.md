Cuando crees bugs en Jira y subas evidencia (screenshots), sigue estas reglas exactas:

---

## Instancia Jira

- URL: https://tbtbglobaltest.atlassian.net
- cloudId: 07249f17-36d8-4633-934f-f23fd0981860
- Proyecto: PRDTEST (ID 10628)
- Credenciales en .env: JIRA_EMAIL, JIRA_API_TOKEN, JIRA_BASE_URL

---

## Regla de oro — INVIOLABLE

NUNCA crear, mover ni modificar nada en Jira sin aprobación explícita del usuario.
Flujo obligatorio: terminas la prueba → muestras preview del bug → esperas "sí, créalo" → recién ejecutas.

---

## Campos obligatorios al crear un bug

| Campo       | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| Proyecto    | PRDTEST                                                            |
| Tipo        | Error                                                              |
| Label       | PRDTEST                                                            |
| Fix Version | 1.0.0-app o 1.0.0-connect según el módulo                         |
| Sprint      | Activo — buscar con JQL: project=PRDTEST AND sprint in openSprints() → usar customfield_10020 |
| Asignado    | Yohann Pardo                                                       |
| Descripción | En español, contentFormat: markdown                                |
| Link        | Tipo "Blocks" al Requerimiento padre                               |
| Transición  | Mover Requerimiento a "En espera" (transition ID 7) tras crear bug |

NUNCA usar "HECHO" — siempre "APROBADO POR QA" para aprobar.

---

## Cómo subir imágenes y que se vean bien en Jira

Las imágenes deben ir en la DESCRIPCIÓN del bug (no en comentarios), usando type:"file" con el UUID real del media API. Usar type:"external" con URL produce miniaturas pequeñas o rotas.

### Paso 1 — Subir el archivo como adjunto

```
POST /rest/api/3/issue/{ticketKey}/attachments
Authorization: Basic base64(email:apitoken)
X-Atlassian-Token: no-check
Content-Type: multipart/form-data; boundary=...
```

La respuesta devuelve `id` (entero, ej: 52298). El UUID de media NO viene aquí.

### Paso 2 — Obtener el UUID real

```
GET /rest/api/3/attachment/content/{id}
Authorization: Basic base64(email:apitoken)
```

Responde HTTP 303 con header Location:
`https://api.media.atlassian.com/file/{UUID}/binary?token=...`

Extrae el UUID con: `/\/file\/([a-f0-9-]{36})\/binary/`

### Paso 3 — Insertar en la descripción del bug (ADF)

```json
{
  "type": "mediaSingle",
  "attrs": { "layout": "center" },
  "content": [{
    "type": "media",
    "attrs": {
      "type": "file",
      "id": "UUID-del-paso-2",
      "collection": ""
    }
  }]
}
```

Añadir estos nodos al final del content de la descripción vía:

```
PUT /rest/api/3/issue/{ticketKey}
Body: { "fields": { "description": { "version": 1, "type": "doc", "content": [...descripcion_existente, ...mediaNodes] } } }
```

### Implementación de referencia (Node.js, sin dependencias externas)

```js
function uploadAttachment(ticketKey, filePath) {
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const boundary = '----FormBoundary' + Date.now();
    const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`);
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileData, footer]);
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    const url = new URL(`/rest/api/3/issue/${ticketKey}/attachments`, JIRA_BASE_URL);
    return new Promise((resolve, reject) => {
        const req = https.request({
            method: 'POST', hostname: url.hostname, path: url.pathname,
            headers: { 'Authorization': `Basic ${auth}`, 'X-Atlassian-Token': 'no-check', 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length },
        }, (res) => {
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => { if (res.statusCode === 200) resolve(JSON.parse(data)[0]); else reject(new Error(`${res.statusCode}: ${data}`)); });
        });
        req.on('error', reject); req.write(body); req.end();
    });
}

function getMediaUuid(attachmentId) {
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    const url = new URL(`/rest/api/3/attachment/content/${attachmentId}`, JIRA_BASE_URL);
    return new Promise((resolve, reject) => {
        const req = https.request({ method: 'GET', hostname: url.hostname, path: url.pathname, headers: { 'Authorization': `Basic ${auth}` } }, (res) => {
            res.resume();
            if (res.statusCode === 303 && res.headers.location) {
                const match = res.headers.location.match(/\/file\/([a-f0-9-]{36})\/binary/);
                if (match) resolve(match[1]); else reject(new Error('UUID no encontrado'));
            } else reject(new Error(`Expected 303, got ${res.statusCode}`));
        });
        req.on('error', reject); req.end();
    });
}

// Uso:
const att = await uploadAttachment('PRDTEST-123', 'screenshot.png');
const uuid = await getMediaUuid(att.id);
// uuid ya es el ID para type:"file" en ADF
```
