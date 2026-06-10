# Plan de Prueba — PRDTEST-67
**F-007: Mostrar Datos de Facility en PDF del TRF — Connect**
**Fecha:** 2026-05-27
**Perfil:** Control Tower QA (`qa.connectprd@yopmail.com` / `@ConnectPrd1`)
**URL:** https://rdglobaldx.com/rdstp_connect_prd_qa
**Carpeta evidencia:** `evidencia/PRDTEST-67/`

---

## TC-01 — TRF_PDF_FacilityFields_Connect
**DADO** que se genera un TRF en Connect con Facility completa  
**ENTONCES** el PDF incluye: Facility name, Address, City/State/ZIP, Phone

Pasos:
1. Login Connect como Control Tower QA
2. Navegar Samples
3. Abrir View TRF de un sample vía Connect (ej: sample 5620)
4. Verificar en PDF: Facility name, Address, City/State/ZIP, Phone presentes con datos

---

## TC-03 — TRF_PDF_FieldMapping_Connect
**ENTONCES** los labels son idénticos a F-006 App: "Facility name" / "Address" / "City, State ZIP" / "Phone"

Pasos:
1. Usar PDF del TC-01
2. Confirmar labels exactos

---

## TC-04 — TRF_PDF_Layout_Connect
**ENTONCES** sección Facility en posición designada, fuente y alineación consistentes

Pasos:
1. Usar PDF del TC-01
2. Verificar layout visual: posición superior izquierda, tipografía uniforme

---

## TC-06 — TRF_PDF_BlankFields_Connect
**DADO** que un TRF en Connect no tiene Facility asignada  
**ENTONCES** PDF se genera sin error, sección Facility en blanco

Pasos:
1. Buscar sample vía Connect sin Facility (ej: sample 5616)
2. Abrir View TRF
3. Verificar: PDF generado OK, Facility fields en blanco, sin mensaje de error

---

## Notas
- No hay storage state guardado: el executor debe hacer login manual
- Comparar TC-01 vs TC-06 para documentar diferencia
