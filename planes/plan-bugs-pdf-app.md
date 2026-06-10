# Plan de Captura — Bugs PDF TRF App
**Tickets:** PRDTEST-99, PRDTEST-100, PRDTEST-101, PRDTEST-102, PRDTEST-109
**Fecha:** 2026-05-28
**Perfil:** HCP Venezuela (`diego.rodriguez@tbtbglobal.com` / `@Diego123`)
**URL App:** https://rdglobaldx.com/rdstp_app_prd_qa
**Carpeta evidencia base:** `evidencia/`

---

## Objetivo

Verificar y capturar evidencia fresca de los siguientes bugs reportados en el PDF del TRF:

- **PRDTEST-99**: Account Number de Labcorp no aparece en el PDF del TRF
- **PRDTEST-100**: Facility Information vacía en PDF + solo radio buttons (Private Practice/Hospital) en formulario
- **PRDTEST-101**: Teléfono aparece en sección incorrecta del PDF
- **PRDTEST-102**: Labels vacíos + typo "Addresss" (triple s) en PDF
- **PRDTEST-109**: Typo "Addresss" en PDF TRF App (igual que 102)

---

## Precondiciones

- No hay storage state — hacer login manual
- Account number de diego: 12475851
- Teléfono del perfil: 11114711

---

## TC-BUG-99 — Account Number Labcorp en PDF

Pasos:
1. Login App como `diego.rodriguez@tbtbglobal.com` / `@Diego123`
2. Ir a Samples → New TRF
3. Completar: paciente, treatment, intended use, test type, facility
4. Guardar TRF
5. Abrir View TRF → capturar PDF
6. Verificar si aparece el Account Number (Labcorp)
7. Screenshot: `evidencia/PRDTEST-99/01-trf-pdf-account-number.png`

---

## TC-BUG-100 — Facility Information vacía

Pasos:
1. Usar el TRF creado en TC-BUG-99 (o crear nuevo)
2. Al crear TRF: capturar el formulario — verificar si hay solo radio buttons (Private Practice/Hospital) o dropdown de workplace
3. Screenshot formulario: `evidencia/PRDTEST-100/01-trf-form-facility-section.png`
4. Abrir View TRF (PDF)
5. Capturar sección Facility en PDF — verificar si está vacía
6. Screenshot PDF: `evidencia/PRDTEST-100/02-trf-pdf-facility-vacia.png`

---

## TC-BUG-101 — Teléfono en sección incorrecta

Pasos:
1. Usar el TRF del perfil de diego (phone: 11114711)
2. Abrir View TRF (PDF)
3. Buscar dónde aparece "11114711" en el PDF
4. Screenshot de la sección donde aparece el teléfono: `evidencia/PRDTEST-101/01-trf-pdf-phone-wrong-section.png`
5. Screenshot del área "Phone Number" label para mostrar que está vacío: `evidencia/PRDTEST-101/02-trf-pdf-phone-label-vacio.png`

---

## TC-BUG-102 / PRDTEST-109 — Typo "Addresss" y labels vacíos

Pasos:
1. Abrir View TRF (PDF)
2. Buscar el typo "Addresss" (triple s) en el PDF
3. Screenshot mostrando el typo: `evidencia/PRDTEST-102/01-trf-pdf-addresss-typo.png`
4. Screenshot de labels vacíos en PDF: `evidencia/PRDTEST-102/02-trf-pdf-labels-vacios.png`
5. Mismas screenshots para PRDTEST-109: `evidencia/PRDTEST-109/01-trf-pdf-addresss-typo.png`

---

## Notas

- El PDF se abre en el viewer del browser — es un blob: URL que no tiene DOM accesible
- Capturar screenshots visuales del PDF renderizado
- Para ver el PDF: Samples → seleccionar un sample → View TRF button
- Si el PDF no muestra los bugs, probar creando un TRF nuevo con datos completos
