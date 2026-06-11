async page => {
  const fs = require('fs');
  const url = page.url();
  const outPath = 'c:/ultimate/evidencia/RDSTP-763/trf-043025.pdf';
  const base64 = await page.evaluate(async (blobUrl) => {
    const resp = await fetch(blobUrl);
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const CHUNK = 8192;
    let b64 = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      b64 += btoa(String.fromCharCode(...bytes.slice(i, i + CHUNK)));
    }
    return b64;
  }, url);
  const pdfBuf = Buffer.from(base64, 'base64');
  fs.writeFileSync(outPath, pdfBuf);
  return `OK: ${outPath} (${pdfBuf.length} bytes)`;
}
