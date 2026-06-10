# Plan de Prueba — PRDTEST-17
**F-004: Mover Campo Facility de Pickup a Creación de TRF — App (CDCA-594)**

**Fecha:** 2026-05-26  
**URL App:** https://rdglobaldx.com/rdstp_app_prd_qa  
**Usuario:** diego.rodriguez@tbtbglobal.com / @Diego123  
**Plataforma:** App (HCP)

---

## Casos de Prueba

### TC-01 | PRDTEST-18 — Campo Facility obligatorio en creación de TRF
**Objetivo:** Verificar que Facility aparece y es obligatorio en Samples > Request TRF

**Pasos:**
1. Login como HCP (diego.rodriguez@tbtbglobal.com)
2. Navegar a Samples > Request TRF
3. Verificar que el campo Facility aparece en el formulario
4. Intentar enviar el formulario sin seleccionar Facility
5. Verificar que aparece error de validación

**Resultado esperado:** Campo Facility visible y obligatorio; error al enviar sin seleccionar

---

### TC-02 | PRDTEST-19 — Dropdown Facility con mismas opciones que Pickup
**Objetivo:** Verificar que el dropdown de Facility en TRF muestra las mismas opciones disponibles

**Pasos:**
1. En Samples > Request TRF, abrir el selector Facility
2. Anotar las opciones disponibles
3. Navegar a Pickup > Request Pickup (si existe campo de referencia)
4. Comparar opciones

**Resultado esperado:** Dropdown visible con opciones de Facility; misma lógica de filtrado

---

### TC-03 | PRDTEST-20 — Facility removido de Request Pickup
**Objetivo:** Verificar que el campo Facility NO aparece en Pickup > Request Pickup

**Pasos:**
1. Navegar a Pickup > Request Pickup (o sección equivalente)
2. Revisar todos los campos del formulario
3. Confirmar que Facility no está presente

**Resultado esperado:** Campo Facility ausente en el formulario de Pickup

---

### TC-04 | PRDTEST-21 — Registros existentes no afectados
**Objetivo:** Verificar que TRFs/muestras previas no fueron modificados

**Pasos:**
1. Navegar a historial de muestras/TRFs
2. Abrir registros pre-existentes
3. Verificar que los datos de Facility se mantienen correctos

**Resultado esperado:** Registros existentes intactos, sin datos perdidos o modificados

---

## Credenciales
- HCP: diego.rodriguez@tbtbglobal.com / @Diego123
