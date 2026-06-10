const fs = require('fs');
const path = require('path');

function imgToBase64(filePath) {
  try {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
    if (!fs.existsSync(abs)) return null;
    return 'data:image/png;base64,' + fs.readFileSync(abs).toString('base64');
  } catch (e) { return null; }
}

const fecha = '2026-05-27';

const modules = [
  {
    id: 'app-hi-ve',
    modulo: 'APP — Módulo App',
    usuario: 'HI Venezuela',
    email: 'anderson.garcia.hi@yopmail.com',
    rol: 'Hospital Institution (HI)',
    flujo: 'Flow B/C — RC acumula muestras y gestiona envío al lab',
    estado: 'PASS',
    casos: [
      {
        id: 'TC-01', nombre: 'Login HI Venezuela', resultado: 'PASS',
        pasos: ['Navegar a https://rdglobaldx.com/rdstp_app_prd_qa', 'Ingresar credenciales HI Venezuela', 'Verificar redirección al Home'],
        evidencia: 'reg-hi-ve-home.png', notas: 'Login exitoso. Home muestra 6 muestras pendientes de pickup. Iniciales "HA" visibles.'
      },
      {
        id: 'TC-02', nombre: 'Navegación Samples', resultado: 'PASS',
        pasos: ['Click en "Samples" en el menú', 'Verificar lista de muestras'],
        evidencia: 'reg-hi-ve-samples.png', notas: 'Samples carga correctamente con múltiples muestras. Se detecta paciente "hola mundo" con ID: 1235234 (posible dato de prueba no limpiado).'
      },
      {
        id: 'TC-03', nombre: 'Navegación Pickups', resultado: 'PASS',
        pasos: ['Click en "Pickups" en el menú', 'Verificar lista de pickups'],
        evidencia: 'reg-hi-ve-pickups.png', notas: 'Pickups carga correctamente. 1 pickup activo (Dr. Medico Uno). Bug detectado: texto truncado en descripción de la página.'
      },
      {
        id: 'TC-04', nombre: 'Nuevo TRF (New Test Requisition Form)', resultado: 'PASS',
        pasos: ['Click "New Test Requisition Form"', 'Seleccionar HCP (Medico Dos)', 'Seleccionar paciente (Paciente Medico Dos)', 'Llenar fecha y hora de colección', 'Seleccionar "Ongoing monitoring" como intended use', 'Seleccionar test "Plasma Lyso-GL-1"', 'Marcar los 3 checkboxes de consentimiento', 'Click Continue', 'Verificar resumen (Step 2)', 'Click Save'],
        evidencia: 'reg-hi-ve-trf-success.png', notas: 'Flujo TRF completo funciona. Bugs menores detectados: (1) mensajes de validación visibles antes de interacción, (2) typo "Sample collecion date", (3) typo "succesfully saved".'
      },
      {
        id: 'TC-05', nombre: 'Mensajes y Soporte', resultado: 'PASS',
        pasos: ['Navegar a Messages', 'Navegar a Support'],
        evidencia: 'reg-hi-ve-support.png', notas: 'Messages sin mensajes nuevos (badge 0). Support muestra sección RDSTP introduction y contactos.'
      },
      {
        id: 'TC-06', nombre: 'Logout HI Venezuela', resultado: 'PASS',
        pasos: ['Click "Log out" en sidebar', 'Confirmar logout en modal', 'Verificar redirección al login'],
        evidencia: 'reg-hi-ve-logout.png', notas: 'Modal de confirmación de logout funciona correctamente.'
      }
    ],
    bugs: [
      { id: 'BUG-01', severidad: 'Minor', titulo: 'Texto truncado en descripción Pickups', descripcion: 'La descripción de la página Pickups muestra texto cortado: "Track your requests in real time, access results and provide information about the Check the status..."' },
      { id: 'BUG-02', severidad: 'Minor', titulo: 'Validaciones visibles antes de interacción en TRF', descripcion: 'Los mensajes "This field is required." se muestran en "Intended use" y "Test type" antes de que el usuario interactúe con el formulario.' },
      { id: 'BUG-03', severidad: 'Minor', titulo: 'Typo: "Sample collecion date"', descripcion: 'En el resumen del TRF (Step 2), el campo dice "Sample collecion date" (falta la \'t\' en collection).' },
      { id: 'BUG-04', severidad: 'Minor', titulo: 'Typo: "succesfully saved"', descripcion: 'El mensaje de éxito al guardar un TRF dice "Test Requisition Form succesfully saved" (falta \'s\' en successfully).' },
      { id: 'BUG-05', severidad: 'Critical', titulo: 'Error JS: insertBefore en consola', descripcion: 'Error persistente en consola: "NotFoundError: Failed to execute \'insertBefore\' on \'Node\': The node before which the new node is to be inserted is not a child of this node." Afecta a múltiples usuarios.' }
    ]
  },
  {
    id: 'app-hcp-ve',
    modulo: 'APP — Módulo App',
    usuario: 'HCP Venezuela',
    email: 'diego.rodriguez@tbtbglobal.com',
    rol: 'Healthcare Professional (HCP)',
    flujo: 'Flow A — HCP toma muestra y pide pickup directo con Marken',
    estado: 'PASS',
    casos: [
      {
        id: 'TC-07', nombre: 'Login HCP Venezuela', resultado: 'PASS',
        pasos: ['Ingresar credenciales HCP Venezuela (diego.rodriguez@tbtbglobal.com)', 'Verificar home con datos del usuario'],
        evidencia: 'reg-hcp-ve-home.png', notas: 'Login exitoso. Home muestra 177 muestras pendientes de pickup y 42 en proceso. Iniciales "DR" = Diego Rodriguez. Modal "Were your samples collected?" aparece al intentar crear pickup (comportamiento esperado para confirmación de pickups previos).'
      },
      {
        id: 'TC-08', nombre: 'Confirmación de muestras colectadas (Modal previo a pickup)', resultado: 'PASS',
        pasos: ['Click Request pickup service', 'Modal pregunta "Were your samples collected?"', 'Seleccionar "Yes" para 2 pickups pendientes', 'Ingresar fecha de colección para cada uno', 'Click Send'],
        evidencia: 'reg-hcp-ve-modal-ready.png', notas: 'Bug detectado: El botón "Today" del 2do datepicker actualiza el 1ro. Workaround: escribir la fecha directamente con el teclado en el 2do campo.'
      },
      {
        id: 'TC-09', nombre: 'Formulario New Pickup Request (Flow A)', resultado: 'PASS',
        pasos: ['Click Request pickup service (post-confirmación)', 'Formulario New pickup request visible', 'Ingresar fecha y hora del pickup', 'Seleccionar TRF(s) a vincular', 'Verificar que Continue se habilita'],
        evidencia: 'reg-hcp-ve-pickup-form-ready.png', notas: 'Formulario muestra 177 TRFs disponibles. Continue se habilita correctamente al ingresar fecha, hora y seleccionar al menos un TRF.'
      },
      {
        id: 'TC-10', nombre: 'Módulos Samples, Messages, Profile', resultado: 'PASS',
        pasos: ['Navegar a Samples — 185 muestras enviadas, 177 pendientes de pickup', 'Navegar a Messages — sin mensajes', 'Navegar a Profile — datos del usuario'],
        evidencia: 'reg-hcp-ve-profile.png', notas: 'Profile muestra nombre "DiegoDos RodriguezDos" (dato de prueba). Todos los módulos cargan correctamente.'
      }
    ],
    bugs: [
      { id: 'BUG-06', severidad: 'Major', titulo: 'Bug datepicker duplicado: "Today" actualiza el 1er campo en lugar del 2do', descripcion: 'En el modal "Were your samples collected?", al hacer click en el botón "Today" del 2do datepicker, se actualiza el 1er datepicker en lugar del 2do. Requiere ingresar la fecha manualmente en el 2do campo.' },
      { id: 'BUG-07', severidad: 'Minor', titulo: 'Botón Request Pickup desaparece temporalmente', descripcion: 'Después de procesar el modal de confirmación, el botón "Request pickup service" desaparece brevemente hasta que se recarga la página.' }
    ]
  },
  {
    id: 'app-hcp-br',
    modulo: 'APP — Módulo App',
    usuario: 'HCP Brasil',
    email: 'testbrazilqa@yopmail.com',
    rol: 'Healthcare Professional (HCP) — Brasil',
    flujo: 'Flow A Brasil',
    estado: 'FAIL',
    casos: [
      {
        id: 'TC-11', nombre: 'Login HCP Brasil', resultado: 'FAIL',
        pasos: ['Ingresar credenciales testbrazilqa@yopmail.com / Test@1234', 'Verificar resultado'],
        evidencia: 'reg-hcp-br-login-error.png', notas: 'Login falla: "Incorrect email or password. Please check your credentials and try again." Las credenciales del CLAUDE.md no funcionan.'
      }
    ],
    bugs: [
      { id: 'BUG-08', severidad: 'Blocker', titulo: 'Cuenta HCP Brasil inactiva o credenciales incorrectas', descripcion: 'testbrazilqa@yopmail.com / Test@1234 — Login falla. Puede ser cuenta desactivada o contraseña cambiada.' }
    ]
  },
  {
    id: 'app-hcp-usa',
    modulo: 'APP — Módulo App',
    usuario: 'HCP USA Labcorp',
    email: 'testlabcorpqa@yopmail.com',
    rol: 'Healthcare Professional (HCP) — USA PSC',
    flujo: 'USA Flow (PSC + FedEx)',
    estado: 'FAIL',
    casos: [
      {
        id: 'TC-12', nombre: 'Login HCP USA Labcorp', resultado: 'FAIL',
        pasos: ['Ingresar credenciales testlabcorpqa@yopmail.com / Test@1234', 'Verificar resultado'],
        evidencia: 'reg-hcp-usa-login-error.png', notas: 'Login falla: "Incorrect email or password." Las credenciales del CLAUDE.md no funcionan.'
      }
    ],
    bugs: [
      { id: 'BUG-09', severidad: 'Blocker', titulo: 'Cuenta HCP USA inactiva o credenciales incorrectas', descripcion: 'testlabcorpqa@yopmail.com / Test@1234 — Login falla.' }
    ]
  },
  {
    id: 'app-hcp-gulf',
    modulo: 'APP — Módulo App',
    usuario: 'HCP Gulf',
    email: 'gulfhcpqa@yopmail.com',
    rol: 'Healthcare Professional (HCP) — Gulf',
    flujo: 'Gulf Flow (lógica emails pickups)',
    estado: 'FAIL',
    casos: [
      {
        id: 'TC-13', nombre: 'Login HCP Gulf', resultado: 'FAIL',
        pasos: ['Ingresar credenciales gulfhcpqa@yopmail.com / Gulf@1234', 'Verificar resultado'],
        evidencia: 'reg-hcp-gulf-login.png', notas: 'Login falla: "Incorrect email or password." Las credenciales del CLAUDE.md no funcionan.'
      }
    ],
    bugs: [
      { id: 'BUG-10', severidad: 'Blocker', titulo: 'Cuenta HCP Gulf inactiva o credenciales incorrectas', descripcion: 'gulfhcpqa@yopmail.com / Gulf@1234 — Login falla.' }
    ]
  },
  {
    id: 'connect-ct',
    modulo: 'CONNECT — Módulo Connect',
    usuario: 'Control Tower',
    email: 'qa.connectprd@yopmail.com',
    rol: 'Control Tower / Admin',
    flujo: 'Control Tower gestiona pickups y supervisa — Flow C',
    estado: 'PASS',
    casos: [
      {
        id: 'TC-14', nombre: 'Login Control Tower', resultado: 'PASS',
        pasos: ['Navegar a https://rdglobaldx.com/rdstp_connect_prd_qa', 'Ingresar credenciales CT', 'Verificar dashboard'],
        evidencia: 'reg-ct-dashboard.png', notas: 'Login exitoso. Dashboard muestra estadísticas completas: 442 pickups, 403 en tránsito, 220 en procesamiento, charts de enrollments.'
      },
      {
        id: 'TC-15', nombre: 'Módulo Samples CT', resultado: 'PASS',
        pasos: ['Navegar a Samples', 'Verificar tabla de muestras'],
        evidencia: 'reg-ct-samples.png', notas: '2503 resultados. Vista tabular con columnas: ID, País, Paciente, Test, Status, TRF, Fuente, Doctor, País, Enfermedad, Fecha. Edición disponible por fila.'
      },
      {
        id: 'TC-16', nombre: 'Módulo Pickups CT — Gestión de estados', resultado: 'PASS',
        pasos: ['Navegar a Pickups', 'Verificar 863 pickups', 'Abrir detalle de un pickup (ID 5116)', 'Verificar Status Monitoring'],
        evidencia: 'reg-ct-pickup-status.png', notas: 'CT puede actualizar el estado de pickups. Status Monitoring permite confirmar llegada al lab con fecha. Opción "If the entire pickup is lost, please Click here" disponible.'
      },
      {
        id: 'TC-17', nombre: 'Módulos Institutions, Providers, Patients, Users', resultado: 'PASS',
        pasos: ['Institutions: 465 resultados', 'Providers: 125 resultados', 'Patients: 265 resultados', 'Users: 249 resultados'],
        evidencia: 'reg-ct-users.png', notas: 'Todos los catálogos funcionan correctamente con datos de producción QA.'
      },
      {
        id: 'TC-18', nombre: 'Collection Supplies CT', resultado: 'PASS',
        pasos: ['Navegar a Collection Supplies', 'Verificar 185 supplies'],
        evidencia: 'reg-ct-collection-supplies.png', notas: '185 resultados con supplies de Japón, Venezuela, Colombia. Statuses: Pending delivery, Delivered, Delayed.'
      },
      {
        id: 'TC-19', nombre: 'Mensajes CT', resultado: 'PASS',
        pasos: ['Navegar a Messages', 'Verificar inbox con 99+ mensajes'],
        evidencia: 'reg-ct-messages.png', notas: '99+ mensajes. Incluye conversaciones con DiegoDos RodriguezDos sobre tracking de pickups.'
      }
    ],
    bugs: []
  },
  {
    id: 'connect-labcorp',
    modulo: 'CONNECT — Módulo Connect',
    usuario: 'Labcorp',
    email: 'labcorp@yopmail.com',
    rol: 'Laboratorio — Recibe y procesa muestras',
    flujo: 'Labcorp recibe muestras y sube resultados',
    estado: 'PASS',
    casos: [
      {
        id: 'TC-20', nombre: 'Login Labcorp', resultado: 'PASS',
        pasos: ['Ingresar credenciales labcorp@yopmail.com / Admin123@', 'Verificar dashboard'],
        evidencia: 'reg-labcorp-dashboard.png', notas: 'Login exitoso. Dashboard similar a CT pero sin módulo de Mensajes visible. Usuario "EF".'
      },
      {
        id: 'TC-21', nombre: 'Upload de resultados (función crítica Labcorp)', resultado: 'PASS',
        pasos: ['Navegar a Samples', 'Abrir detalle de una muestra', 'Verificar opción "Want to upload results?"', 'Verificar botón "Upload document"'],
        evidencia: 'reg-labcorp-sample-detail.png', notas: 'Funcionalidad de upload de resultados disponible. Bug de typo detectado en el mensaje de advertencia.'
      },
      {
        id: 'TC-22', nombre: 'Samples y Pickups Labcorp', resultado: 'PASS',
        pasos: ['Samples: 2503 resultados', 'Pickups: 863 resultados'],
        evidencia: 'reg-labcorp-pickups.png', notas: 'Labcorp tiene acceso a todos los datos del sistema (misma cantidad que CT).'
      }
    ],
    bugs: [
      { id: 'BUG-11', severidad: 'Minor', titulo: 'Typo en mensaje de upload results', descripcion: 'En el detalle de muestra, el mensaje dice "as hey will be shared with the HCP" — falta la \'t\' en "they".' }
    ]
  }
];

const allBugs = modules.flatMap(m => m.bugs);
const totalTC = modules.reduce((s, m) => s + m.casos.length, 0);
const totalPass = modules.reduce((s, m) => s + m.casos.filter(c => c.resultado === 'PASS').length, 0);
const totalFail = modules.reduce((s, m) => s + m.casos.filter(c => c.resultado === 'FAIL').length, 0);

function escImg(name) {
  const b64 = imgToBase64(name);
  if (!b64) return `<div class="no-img">📷 Sin imagen: ${name}</div>`;
  return `<img src="${b64}" alt="${name}" class="evidence-img" onclick="this.classList.toggle('zoom')">`;
}

const severityClass = { Blocker: 'blocker', Critical: 'critical', Major: 'major', Minor: 'minor' };

let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Regresión Completa RDSTP — ${fecha}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f2f5; color: #1a1a2e; }

  /* HEADER */
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 40px; text-align: center; }
  .header h1 { font-size: 2.4em; margin-bottom: 10px; letter-spacing: 1px; }
  .header p { opacity: 0.8; font-size: 1em; }
  .header .badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 5px 18px; margin: 5px; font-size: 0.85em; }

  /* SUMMARY CARDS */
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; padding: 30px 40px; max-width: 1400px; margin: 0 auto; }
  .card { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .card .num { font-size: 2.5em; font-weight: 700; margin-bottom: 5px; }
  .card .label { font-size: 0.85em; color: #666; }
  .card.pass .num { color: #2ecc71; }
  .card.fail .num { color: #e74c3c; }
  .card.total .num { color: #3498db; }
  .card.bugs-c .num { color: #e67e22; }

  /* SECTIONS */
  .container { max-width: 1400px; margin: 0 auto; padding: 0 40px 40px; }

  .module-section { background: white; border-radius: 12px; margin-bottom: 30px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .module-header { padding: 20px 25px; border-bottom: 2px solid #f0f2f5; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; }
  .module-header.pass { border-left: 5px solid #2ecc71; }
  .module-header.fail { border-left: 5px solid #e74c3c; }
  .module-title { font-size: 1.2em; font-weight: 700; }
  .module-meta { font-size: 0.85em; color: #666; margin-top: 4px; }
  .module-meta strong { color: #333; }
  .status-badge { padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85em; white-space: nowrap; }
  .status-badge.pass { background: #d5f5e3; color: #1e8449; }
  .status-badge.fail { background: #fdedec; color: #c0392b; }

  /* TEST CASES */
  .tc-list { padding: 15px 25px; }
  .tc { border: 1px solid #e8e8e8; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
  .tc-header { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #fafafa; }
  .tc-header:hover { background: #f0f2f5; }
  .tc-id { font-weight: 700; font-size: 0.85em; color: #666; margin-right: 10px; }
  .tc-name { font-weight: 600; font-size: 0.95em; flex: 1; }
  .tc-badge { padding: 3px 12px; border-radius: 12px; font-size: 0.8em; font-weight: 700; }
  .tc-badge.pass { background: #d5f5e3; color: #1e8449; }
  .tc-badge.fail { background: #fdedec; color: #c0392b; }
  .tc-body { padding: 16px; background: white; border-top: 1px solid #e8e8e8; }
  .tc-body.hidden { display: none; }
  .steps-list { list-style: decimal; padding-left: 20px; margin-bottom: 12px; }
  .steps-list li { padding: 3px 0; font-size: 0.9em; color: #444; }
  .notes { background: #f8f9fa; border-left: 3px solid #3498db; padding: 8px 12px; font-size: 0.88em; margin-bottom: 12px; border-radius: 0 6px 6px 0; }
  .evidence-img { max-width: 100%; max-height: 400px; border: 2px solid #e8e8e8; border-radius: 6px; cursor: pointer; transition: transform 0.2s; display: block; margin-top: 8px; }
  .evidence-img.zoom { max-width: none; max-height: none; width: 100%; position: relative; z-index: 10; }
  .no-img { color: #999; font-size: 0.85em; font-style: italic; padding: 10px; }

  /* BUGS */
  .bugs-section { padding: 15px 25px; border-top: 2px solid #f0f2f5; }
  .bugs-title { font-size: 1em; font-weight: 700; margin-bottom: 12px; color: #e74c3c; }
  .bug { border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; border-left: 4px solid; }
  .bug.blocker { background: #fde8e8; border-color: #c0392b; }
  .bug.critical { background: #fef0e7; border-color: #e67e22; }
  .bug.major { background: #fef9e7; border-color: #f39c12; }
  .bug.minor { background: #eaf6fb; border-color: #3498db; }
  .bug-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .bug-id { font-weight: 700; font-size: 0.85em; color: #666; }
  .bug-sev { padding: 2px 10px; border-radius: 10px; font-size: 0.75em; font-weight: 700; }
  .bug-sev.blocker { background: #c0392b; color: white; }
  .bug-sev.critical { background: #e67e22; color: white; }
  .bug-sev.major { background: #f39c12; color: white; }
  .bug-sev.minor { background: #3498db; color: white; }
  .bug-title { font-weight: 600; font-size: 0.95em; }
  .bug-desc { font-size: 0.88em; color: #555; line-height: 1.5; }

  /* ALL BUGS SUMMARY */
  .all-bugs { background: white; border-radius: 12px; margin-bottom: 30px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .all-bugs-header { padding: 20px 25px; border-bottom: 2px solid #f0f2f5; border-left: 5px solid #e74c3c; }
  .all-bugs-header h2 { font-size: 1.3em; }
  .all-bugs-content { padding: 20px 25px; }

  /* FOOTER */
  .footer { text-align: center; padding: 30px; color: #888; font-size: 0.85em; background: white; margin-top: 20px; }

  /* SECTION DIVIDER */
  .section-label { font-size: 1.1em; font-weight: 700; color: #1a1a2e; margin: 30px 0 15px; padding-bottom: 8px; border-bottom: 2px solid #e8e8e8; }
</style>
</head>
<body>

<div class="header">
  <h1>🧪 Regresión Completa RDSTP</h1>
  <p>Reporte de pruebas de regresión automatizadas — ${fecha}</p>
  <br>
  <span class="badge">App TpT / TBTB Connect AZ</span>
  <span class="badge">Ambiente: PRD QA</span>
  <span class="badge">Agentes: smoke-tester | adversarial-breaker | ux-auditor</span>
</div>

<div class="summary">
  <div class="card total">
    <div class="num">${totalTC}</div>
    <div class="label">Total de TCs</div>
  </div>
  <div class="card pass">
    <div class="num">${totalPass}</div>
    <div class="label">✅ Passed</div>
  </div>
  <div class="card fail">
    <div class="num">${totalFail}</div>
    <div class="label">❌ Failed</div>
  </div>
  <div class="card bugs-c">
    <div class="num">${allBugs.length}</div>
    <div class="label">🐛 Bugs</div>
  </div>
  <div class="card" style="background: #d5f5e3;">
    <div class="num" style="color:#1e8449;">2</div>
    <div class="label">Usuarios OK</div>
  </div>
  <div class="card" style="background: #fdedec;">
    <div class="num" style="color:#c0392b;">3</div>
    <div class="label">Cuentas Inactivas</div>
  </div>
</div>

<div class="container">

<!-- ALL BUGS SUMMARY -->
<div class="all-bugs">
  <div class="all-bugs-header">
    <h2>🐛 Resumen de Bugs Encontrados (${allBugs.length} bugs)</h2>
  </div>
  <div class="all-bugs-content">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
    ${allBugs.map(b => `
      <div class="bug ${severityClass[b.severidad] || 'minor'}">
        <div class="bug-header">
          <span class="bug-id">${b.id}</span>
          <span class="bug-sev ${severityClass[b.severidad] || 'minor'}">${b.severidad.toUpperCase()}</span>
          <span class="bug-title">${b.titulo}</span>
        </div>
        <div class="bug-desc">${b.descripcion}</div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- APP MODULE -->
<div class="section-label">📱 Módulo APP — https://rdglobaldx.com/rdstp_app_prd_qa</div>

${modules.slice(0,5).map(m => `
<div class="module-section">
  <div class="module-header ${m.estado.toLowerCase()}">
    <div>
      <div class="module-title">${m.usuario}</div>
      <div class="module-meta"><strong>Email:</strong> ${m.email} &nbsp;|&nbsp; <strong>Rol:</strong> ${m.rol}</div>
      <div class="module-meta" style="margin-top:4px"><strong>Flujo:</strong> ${m.flujo}</div>
    </div>
    <span class="status-badge ${m.estado.toLowerCase()}">${m.estado === 'PASS' ? '✅ PASS' : '❌ FAIL'}</span>
  </div>
  <div class="tc-list">
    ${m.casos.map(tc => `
    <div class="tc">
      <div class="tc-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
        <span class="tc-id">${tc.id}</span>
        <span class="tc-name">${tc.nombre}</span>
        <span class="tc-badge ${tc.resultado.toLowerCase()}">${tc.resultado === 'PASS' ? '✅ PASS' : '❌ FAIL'}</span>
      </div>
      <div class="tc-body">
        <div class="notes"><strong>Notas:</strong> ${tc.notas}</div>
        <ul class="steps-list">
          ${tc.pasos.map(p => `<li>${p}</li>`).join('')}
        </ul>
        <strong style="font-size:0.85em;display:block;margin-bottom:4px;">Evidencia:</strong>
        ${escImg(tc.evidencia)}
      </div>
    </div>`).join('')}
  </div>
  ${m.bugs.length > 0 ? `
  <div class="bugs-section">
    <div class="bugs-title">🐛 Bugs en este módulo</div>
    ${m.bugs.map(b => `
    <div class="bug ${severityClass[b.severidad] || 'minor'}">
      <div class="bug-header">
        <span class="bug-id">${b.id}</span>
        <span class="bug-sev ${severityClass[b.severidad] || 'minor'}">${b.severidad.toUpperCase()}</span>
        <span class="bug-title">${b.titulo}</span>
      </div>
      <div class="bug-desc">${b.descripcion}</div>
    </div>`).join('')}
  </div>` : ''}
</div>`).join('')}

<!-- CONNECT MODULE -->
<div class="section-label">🔗 Módulo CONNECT — https://rdglobaldx.com/rdstp_connect_prd_qa</div>

${modules.slice(5).map(m => `
<div class="module-section">
  <div class="module-header ${m.estado.toLowerCase()}">
    <div>
      <div class="module-title">${m.usuario}</div>
      <div class="module-meta"><strong>Email:</strong> ${m.email} &nbsp;|&nbsp; <strong>Rol:</strong> ${m.rol}</div>
      <div class="module-meta" style="margin-top:4px"><strong>Flujo:</strong> ${m.flujo}</div>
    </div>
    <span class="status-badge ${m.estado.toLowerCase()}">${m.estado === 'PASS' ? '✅ PASS' : '❌ FAIL'}</span>
  </div>
  <div class="tc-list">
    ${m.casos.map(tc => `
    <div class="tc">
      <div class="tc-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
        <span class="tc-id">${tc.id}</span>
        <span class="tc-name">${tc.nombre}</span>
        <span class="tc-badge ${tc.resultado.toLowerCase()}">${tc.resultado === 'PASS' ? '✅ PASS' : '❌ FAIL'}</span>
      </div>
      <div class="tc-body">
        <div class="notes"><strong>Notas:</strong> ${tc.notas}</div>
        <ul class="steps-list">
          ${tc.pasos.map(p => `<li>${p}</li>`).join('')}
        </ul>
        <strong style="font-size:0.85em;display:block;margin-bottom:4px;">Evidencia:</strong>
        ${escImg(tc.evidencia)}
      </div>
    </div>`).join('')}
  </div>
  ${m.bugs.length > 0 ? `
  <div class="bugs-section">
    <div class="bugs-title">🐛 Bugs en este módulo</div>
    ${m.bugs.map(b => `
    <div class="bug ${severityClass[b.severidad] || 'minor'}">
      <div class="bug-header">
        <span class="bug-id">${b.id}</span>
        <span class="bug-sev ${severityClass[b.severidad] || 'minor'}">${b.severidad.toUpperCase()}</span>
        <span class="bug-title">${b.titulo}</span>
      </div>
      <div class="bug-desc">${b.descripcion}</div>
    </div>`).join('')}
  </div>` : ''}
</div>`).join('')}

</div><!-- end container -->

<div class="footer">
  Reporte generado por QA Senior Agent RDSTP &nbsp;|&nbsp; ${new Date().toLocaleString('es-VE')} &nbsp;|&nbsp; Sesión: Regresión Completa ${fecha}
</div>

<script>
  // Auto-expand first TC of each module
  document.querySelectorAll('.tc-body').forEach(b => b.classList.add('hidden'));
</script>
</body>
</html>`;

const outputFile = path.join(__dirname, 'reportes', `regresion-completa-${fecha}.html`);
fs.writeFileSync(outputFile, html);
console.log('Reporte generado:', outputFile);
console.log('Total TCs:', totalTC, '| Pass:', totalPass, '| Fail:', totalFail, '| Bugs:', allBugs.length);
