/*
 * helpers/check-yopmail.js â€” GuÃ­a para verificaciÃ³n de emails por flujo
 */
const GUIA = `
================================================================
VERIFICACIÃ“N DE EMAILS POR FLUJO
================================================================

ðŸ“ FLUJO A, B, C, D (Marken)
   Bandeja: https://yopmail.com â†’ soportetbtb@yopmail.com
   Adjuntos esperados: Booking Form + Proforma + TRFs
   Campos:
     - Requestor (HCP del flujo)
     - Contact Email / Contact Phone
     - Pickup Date / Time / Location
     - Number of Samples

ðŸ“ FLUJO GULF (NBCC)
   Bandeja: ajahlan@bloodandcancer.org
   Adjuntos: SOLO TRFs
   âš ï¸ NO Booking Form, NO Proforma
   Si llegan Booking/Proforma â†’ BUG

ðŸ“ FLUJO USA (FedEx)
   Consultar email actual con Yohann
   Adjuntos: TRFs

================================================================
PASOS YOPMAIL (Marken)
================================================================
1. Abrir https://yopmail.com en pestaÃ±a NUEVA
2. Input: "soportetbtb" â†’ Check Inbox
3. Esperar 60s
4. Click email mÃ¡s reciente
5. Screenshot: evidencia/[TICKET]/email-marken-[YYYYMMDD].png
6. Verificar cada campo y adjunto
7. Si NO llega email â†’ BUG CRÃTICO
`;
console.log(GUIA);
