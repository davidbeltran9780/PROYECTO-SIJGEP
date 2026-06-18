import { useState } from 'react'

const SECCIONES = [
  {
    icono: '📋',
    titulo: 'Dashboard',
    desc: 'Pantalla principal del sistema. Muestra un resumen de expedientes activos, PQRS recientes, alertas de vencimiento urgentes y gráficas de casos por tipo y por mes. Los administradores y secretarias ven el panel completo; los abogados ven solo sus casos asignados.'
  },
  {
    icono: '📁',
    titulo: 'Expedientes',
    desc: 'Gestión de expedientes jurídicos. Permite crear nuevos casos, asignar abogados, cambiar el estado (activo, en proceso, cerrado, archivado) y eliminar expedientes. Incluye búsqueda por texto y filtro de fecha de creación. Solo administradores y secretarias pueden crear y eliminar.'
  },
  {
    icono: '📄',
    titulo: 'Documentos',
    desc: 'Gestión de documentos por expediente. La tabla de expedientes se ordena automáticamente por vencimiento más cercano primero y muestra los días restantes con colores (rojo = vencido, amarillo = urgente, verde = a tiempo). Filtra por tipo de caso y estado de vencimiento. Haz clic en un expediente para ver y subir sus documentos. Los documentos marcados como "Enviados" solo pueden eliminarse por un administrador.'
  },
  {
    icono: '💬',
    titulo: 'PQRS',
    desc: 'Peticiones, Quejas, Reclamos y Sugerencias. Los ciudadanos pueden radicar sin cuenta desde la página pública. Las quejas, reclamos y sugerencias pueden enviarse anónimamente previa verificación de correo con código de 6 dígitos. La tabla interna muestra fecha de creación y fecha de vencimiento (en rojo si ya venció). El cambio de estado requiere confirmación para evitar cambios accidentales. Al radicar, el sistema calcula automáticamente la fecha de vencimiento (15 días hábiles).'
  },
  {
    icono: '🤖',
    titulo: 'Módulo IA',
    desc: 'Asistente jurídico con inteligencia artificial (Google Gemini). Sube un documento (PDF, Word, imagen) y la IA extrae: partes del proceso, hechos numerados, pretensiones, análisis jurídico detallado y normas aplicables. En pantalla se muestra un resumen ejecutivo. Al descargar el PDF o Word obtienes el análisis completo con todas las secciones y el borrador de respuesta institucional según el tipo de caso (tutela, derecho de petición, queja, reclamo, sugerencia).'
  },
  {
    icono: '⚠️',
    titulo: 'Alertas',
    desc: 'Vencimientos de casos y PQRS clasificados en cuatro categorías: Vencidos (ya superaron el plazo), Urgente (0–2 días), Próximo (3–5 días) y A tiempo (más de 5 días). Cada tabla tiene paginación. Los abogados solo ven sus propios casos; administradores y secretarias ven todos incluyendo PQRS.'
  },
  {
    icono: '📊',
    titulo: 'Reportes',
    desc: 'Estadísticas generales del sistema. Muestra tarjetas resumen, tabla de casos próximos a vencer con filtros de fecha y tipo, tabla de PQRS pendientes de respuesta, y gráficas de casos por tipo, estado, mes y carga por abogado. Todas las tablas tienen paginación. Solo visible para administradores y secretarias.'
  },
  {
    icono: '⚙️',
    titulo: 'Administración',
    desc: 'Panel con tres pestañas: Usuarios (crear, editar, activar/desactivar; filtros por ID, correo, rol y estado), Backups (generar respaldos automáticos a Google Drive con historial) y Auditoría (registro completo de acciones del sistema con filtros por fecha, usuario y rol). Todas las tablas tienen paginación.'
  },
  {
    icono: '👤',
    titulo: 'Configuración',
    desc: 'Permite cambiar el nombre y la contraseña de la cuenta desde cualquier rol. Al cambiar la contraseña se requiere ingresar la contraseña actual como verificación de seguridad.'
  },
]

const FAQS = [
  {
    p: '¿Cómo radico una PQRS sin tener cuenta?',
    r: 'Ve a la página de inicio y haz clic en "📨 Radicar PQRS sin cuenta". Llena el formulario con tu nombre, correo y descripción. Al finalizar recibirás el número de radicado en pantalla y por correo electrónico. El sistema calcula automáticamente la fecha de vencimiento (15 días hábiles desde la radicación).'
  },
  {
    p: '¿Puedo enviar una queja de forma anónima?',
    r: 'Sí. En el formulario público de PQRS, al seleccionar Queja, Reclamo o Sugerencia aparece la opción "Enviar de forma anónima". Al activarla, el sistema pedirá verificar tu correo con un código de 6 dígitos. Una vez verificado, puedes radicar sin proporcionar nombre ni documento de identidad.'
  },
  {
    p: '¿Cómo funciona la verificación de correo en PQRS anónimas?',
    r: 'Al marcar la opción anónima, aparece una sección de verificación. Haz clic en "Enviar código de verificación" y recibirás un código de 6 dígitos válido por 10 minutos. Ingrésalo y haz clic en "Verificar". Una vez confirmado, el botón de radicar se activa automáticamente.'
  },
  {
    p: '¿Cómo consulto el estado de mi PQRS?',
    r: 'En la página de inicio haz clic en "🔍 Consultar estado de proceso". Puedes buscar por número de radicado, nombre del demandante o tipo de proceso. También puedes consultar desde la pantalla de confirmación tras radicar.'
  },
  {
    p: '¿Cómo sabe el ciudadano que su PQRS fue respondida?',
    r: 'Cuando el funcionario hace clic en "📧 Enviar respuesta al ciudadano", el sistema envía automáticamente un correo con la respuesta oficial y el número de radicado. La PQRS cambia de estado a "respondido" y queda registrada.'
  },
  {
    p: '¿Qué significan los colores en la tabla de documentos?',
    r: 'Los colores en la columna "Vencimiento" indican el estado del expediente: 🔴 Rojo = ya venció, 🟡 Amarillo = vence en 0–2 días (urgente), 🟠 Ámbar = vence en 3–5 días (próximo), 🟢 Verde = vence en más de 5 días (a tiempo). La tabla se ordena automáticamente mostrando los más urgentes primero.'
  },
  {
    p: '¿Cómo recupero mi contraseña?',
    r: 'En la pantalla de inicio de sesión haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo y recibirás un enlace para restablecerla. También puedes cambiarla desde Configuración ingresando tu contraseña actual.'
  },
  {
    p: '¿Qué formatos acepta el módulo de documentos?',
    r: 'El sistema acepta PDF, Word (.docx, .doc) e imágenes (JPG, JPEG, PNG). El tamaño máximo recomendado por archivo es 10 MB.'
  },
  {
    p: '¿Qué pasa cuando marco un documento como "Enviado"?',
    r: 'El documento queda bloqueado y no puede ser eliminado por quien lo subió. Solo un administrador puede eliminarlo. Esta medida protege documentos que ya fueron remitidos oficialmente.'
  },
  {
    p: '¿Cuánto tiempo tiene la entidad para responder una PQRS?',
    r: 'Según la Ley 1755 de 2015: Petición general 15 días hábiles, Derecho de Petición 10 días hábiles, Consultas 30 días hábiles. El sistema calcula y muestra automáticamente la fecha límite en la tabla de PQRS y en el módulo de Alertas.'
  },
  {
    p: '¿Cómo funciona el Módulo IA?',
    r: 'Sube un documento jurídico (PDF, Word o imagen). La IA analiza el contenido, identifica las partes, extrae los hechos numerados, las pretensiones y genera un análisis jurídico con normas aplicables. En pantalla verás un resumen ejecutivo. Al descargar el PDF o Word obtendrás el análisis completo más el borrador de respuesta institucional listo para revisar y firmar.'
  },
  {
    p: '¿Cómo genero un backup del sistema?',
    r: 'Ve a Administración → pestaña Backups → clic en "Generar Backup Ahora". El respaldo se sube automáticamente a Google Drive y queda registrado en el historial con fecha, tamaño y estado.'
  },
]

function FAQ({ p, r }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: '8px',
      marginBottom: '8px', overflow: 'hidden'
    }}>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          width: '100%', padding: '14px 16px',
          background: abierto ? '#eff6ff' : 'white',
          border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '14px', fontWeight: '600', color: '#1e3a8a',
          textAlign: 'left', gap: '12px',
        }}
      >
        <span>{p}</span>
        <span style={{ flexShrink: 0, color: '#6b7280', fontSize: '16px' }}>
          {abierto ? '▲' : '▼'}
        </span>
      </button>
      {abierto && (
        <div style={{
          padding: '12px 16px', fontSize: '14px',
          color: '#374151', background: '#f9fafb',
          borderTop: '1px solid #e5e7eb', lineHeight: '1.6'
        }}>
          {r}
        </div>
      )}
    </div>
  )
}

export default function Ayuda() {
  return (
    <main className="content">
      <div className="top">
        <h2>Centro de Ayuda</h2>
      </div>

      {/* Guía por módulo */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '15px', color: '#1e3a8a', marginBottom: '16px' }}>
          📖 Guía de módulos
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {SECCIONES.map((s, i) => (
            <div key={i} className="ayuda-modulo-card" style={{
              background: 'white', border: '1px solid #e5e7eb',
              borderRadius: '10px', padding: '16px',
              borderLeft: '4px solid #1e3a8a'
            }}>
              <p style={{ fontWeight: '700', fontSize: '14px', color: '#1e3a8a', marginBottom: '6px' }}>
                {s.icono} {s.titulo}
              </p>
              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '15px', color: '#1e3a8a', marginBottom: '16px' }}>
          ❓ Preguntas frecuentes
        </h3>
        {FAQS.map((f, i) => <FAQ key={i} p={f.p} r={f.r} />)}
      </section>

      {/* Contacto */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '15px', color: '#1e3a8a', marginBottom: '16px' }}>
          📬 Contacto y soporte
        </h3>
        <div className="ayuda-contacto-card" style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '10px', padding: '20px'
        }}>
          <p style={{ fontSize: '14px', color: '#1e3a8a', margin: '0 0 8px' }}>
            Para reportar problemas o solicitar soporte técnico:
          </p>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
            ✉️ <a href="mailto:sigjep.sena@gmail.com" style={{ color: '#1e3a8a' }}>
              sigjep.sena@gmail.com
            </a>
          </p>
        </div>
      </section>

      {/* Créditos — ítem #13 checklist */}
      <section>
        <h3 style={{ fontSize: '15px', color: '#1e3a8a', marginBottom: '16px' }}>
          🏷️ Créditos y tecnologías
        </h3>
        <div style={{
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: '10px', overflow: 'hidden'
        }}>
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Recurso</th>
                <th>Descripción</th>
                <th>Fuente / Licencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Logo SIGJEP</td>
                <td>Imagen institucional del sistema</td>
                <td>Propiedad de la institución · 2026</td>
              </tr>
              <tr>
                <td>Iconos</td>
                <td>Emojis usados como íconos de interfaz</td>
                <td>Unicode Consortium · unicode.org</td>
              </tr>
              <tr>
                <td>Recharts</td>
                <td>Librería de gráficas para React</td>
                <td>MIT License · recharts.org</td>
              </tr>
              <tr>
                <td>React</td>
                <td>Framework de interfaz de usuario</td>
                <td>MIT License · react.dev</td>
              </tr>
              <tr>
                <td>FastAPI</td>
                <td>Framework backend en Python</td>
                <td>MIT License · fastapi.tiangolo.com</td>
              </tr>
              <tr>
                <td>jsPDF</td>
                <td>Generación de documentos PDF en el navegador</td>
                <td>MIT License · github.com/parallax/jsPDF</td>
              </tr>
              <tr>
                <td>docx</td>
                <td>Generación de documentos Word (.docx)</td>
                <td>MIT License · docx.js.org</td>
              </tr>
              <tr>
                <td>Google Gemini AI</td>
                <td>Motor de inteligencia artificial para análisis jurídico</td>
                <td>Google LLC · ai.google.dev</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  )
}
