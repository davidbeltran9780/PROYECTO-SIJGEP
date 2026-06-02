import { useState } from 'react'

const SECCIONES = [
  {
    icono: '📋',
    titulo: 'Dashboard',
    desc: 'Pantalla principal del sistema. Muestra un resumen de expedientes activos, alertas de vencimiento y estadísticas generales. Los administradores ven gráficas de casos por tipo y por mes.'
  },
  {
    icono: '📁',
    titulo: 'Expedientes',
    desc: 'Gestión de expedientes jurídicos. Permite crear nuevos casos, asignar abogados, cambiar el estado (activo, cerrado, archivado) y eliminar expedientes. Solo administradores y secretarias pueden crear.'
  },
  {
    icono: '📄',
    titulo: 'Documentos',
    desc: 'Gestión de documentos por expediente. Busca el expediente en la tabla, haz clic para ver sus documentos, sube archivos (PDF, Word, imágenes) y márcalos como enviados cuando estén listos.'
  },
  {
    icono: '💬',
    titulo: 'PQRS',
    desc: 'Peticiones, Quejas, Reclamos y Sugerencias. Los ciudadanos pueden radicar sin cuenta en la página pública. Los internos gestionan el estado y responden cada solicitud.'
  },
  {
    icono: '🤖',
    titulo: 'Módulo IA',
    desc: 'Asistente jurídico con inteligencia artificial. Sube un documento (PDF, Word, imagen) y la IA lo analiza, clasifica el tipo de caso, genera un resumen y redacta un borrador de respuesta institucional.'
  },
  {
    icono: '⚠️',
    titulo: 'Alertas',
    desc: 'Casos próximos a vencer clasificados en tres categorías: Urgente (menos de 2 días), Próximo (entre 2 y 5 días) y A tiempo (más de 5 días). Los abogados solo ven sus propios casos.'
  },
  {
    icono: '📊',
    titulo: 'Reportes',
    desc: 'Estadísticas generales del sistema. Muestra tarjetas resumen, tabla de vencimientos próximos y gráficas de casos por tipo, estado, mes y carga por abogado. Solo visible para administradores.'
  },
  {
    icono: '⚙️',
    titulo: 'Administración',
    desc: 'Panel de administración con tres secciones: Usuarios (crear, editar, activar/desactivar), Backups (generar respaldos a Google Drive) y Auditoría (historial de acciones del sistema).'
  },
]

const FAQS = [
  {
    p: '¿Cómo radico una PQRS sin tener cuenta?',
    r: 'Ve a la página de inicio y haz clic en "📨 Radicar PQRS sin cuenta". Llena el formulario y al final recibirás un número de radicado para hacer seguimiento.'
  },
  {
    p: '¿Cómo consulto el estado de mi PQRS?',
    r: 'En la página de inicio haz clic en "🔍 Consultar estado de proceso". Puedes buscar por número de radicado, nombre del demandante o tipo de proceso.'
  },
  {
    p: '¿Cómo recupero mi contraseña?',
    r: 'En la pantalla de inicio de sesión haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo y recibirás un enlace para restablecerla.'
  },
  {
    p: '¿Qué formatos acepta el módulo de documentos?',
    r: 'El sistema acepta archivos PDF, Word (.docx, .doc), imágenes (JPG, JPEG, PNG). El tamaño máximo por archivo es 10 MB.'
  },
  {
    p: '¿Qué pasa cuando marco un documento como "Enviado"?',
    r: 'El documento queda bloqueado — ya no puede ser eliminado por el usuario que lo subió. Solo un administrador puede eliminarlo después de enviado.'
  },
  {
    p: '¿Cuánto tiempo tiene la entidad para responder una PQRS?',
    r: 'Según la Ley 1755 de 2015: Petición general 15 días hábiles, Derecho de Petición 10 días hábiles, Consultas 30 días hábiles.'
  },
  {
    p: '¿Puedo enviar una queja de forma anónima?',
    r: 'Sí. En el formulario público de PQRS, al seleccionar Queja, Reclamo o Sugerencia aparece la opción de enviar de forma anónima. Las peticiones formales requieren identificación por ley.'
  },
  {
    p: '¿Cómo genero un backup del sistema?',
    r: 'Ve a Administración → pestaña Backups → clic en "Generar Backup Ahora". El respaldo se sube automáticamente a Google Drive y queda registrado en el historial.'
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
            <div key={i} style={{
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
        <div style={{
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
