---
description: Verifica que el email correcto llegÃ³ a Marken o NBCC. Uso /verificar-email [marken|nbcc]
---

Voy a verificar la bandeja de **$ARGUMENTS**.

### Si es `marken`:
1. Abrir `https://yopmail.com` en pestaÃ±a nueva
2. Input: `soportetbtb` â†’ Check Inbox
3. Esperar Ãºltimo email (60s timeout)
4. Verificar:
   - âœ… Requestor
   - âœ… Contact Email
   - âœ… Contact Phone
   - âœ… Pickup Date / Time
   - âœ… Location
   - âœ… Number of Samples
   - âœ… Adjuntos: Booking Form + Proforma Invoice + TRFs
5. Screenshot: `evidencia/[ticket]/email-marken-[YYYYMMDD].png`

### Si es `nbcc`:
1. Verificar bandeja `ajahlan@bloodandcancer.org`
2. Verificar:
   - âœ… Solo TRFs adjuntos
   - âš ï¸ NO debe haber Booking Form
   - âš ï¸ NO debe haber Proforma Invoice
3. Si llegan Booking/Proforma en Gulf â†’ BUG

Output: reporte del email + screenshot + âœ… PASS o âŒ FAIL.

Procediendo...
