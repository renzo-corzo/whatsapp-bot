const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Archivo donde se guardarán las configuraciones
const CONFIG_FILE = path.join(__dirname, '../config/responses.json');
const STATS_FILE = path.join(__dirname, '../config/stats.json');

// Asegurar que existe el directorio de configuración
async function ensureConfigDir() {
  const configDir = path.dirname(CONFIG_FILE);
  try {
    await fs.access(configDir);
  } catch {
    console.log('📁 Creando directorio de configuración:', configDir);
    await fs.mkdir(configDir, { recursive: true });
  }
}

// Cargar configuración desde archivo
async function loadConfig() {
  try {
    await ensureConfigDir();
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('📄 Creando archivo de configuración por defecto');
    // Configuración por defecto - USAR LA CONFIGURACION COMPLETA
    const defaultConfig = getCompleteConfig();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
}

// Función para obtener la configuración completa
function getCompleteConfig() {
  return {
  responses: {
    'hola': {
      type: 'text',
          message: '🏛️ ¡Hola! Bienvenido/a a la *Caja de Previsión y Seguridad Social de Abogados y Procuradores de Córdoba*.\n\n👋 Soy tu asistente virtual y estoy aquí para ayudarte con consultas sobre nuestros servicios.',
      followUp: 'demo_list'
    },
    'hello': {
      type: 'text',
          message: '🏛️ ¡Hola! Bienvenido/a a la *Caja de Previsión y Seguridad Social de Abogados y Procuradores de Córdoba*.\n\n👋 Soy tu asistente virtual y estoy aquí para ayudarte con consultas sobre nuestros servicios.',
      followUp: 'demo_list'
    },
    'hi': {
      type: 'text',
          message: '🏛️ ¡Hola! Bienvenido/a a la *Caja de Previsión y Seguridad Social de Abogados y Procuradores de Córdoba*.\n\n👋 Soy tu asistente virtual y estoy aquí para ayudarte con consultas sobre nuestros servicios.',
      followUp: 'demo_list'
    },
    'menu': {
      type: 'text',
          message: '📋 *Caja de Abogados - Córdoba*\n\nAquí tienes nuestro menú de servicios:',
      followUp: 'demo_list'
    },
    'opciones': {
      type: 'text',
          message: '📋 *Caja de Abogados - Córdoba*\n\nAquí tienes las opciones disponibles:',
      followUp: 'demo_list'
    }
  },
  lists: {
    'demo_list': {
          title: '🏥 Servicio Médico Caja de Abogados',
          description: 'Selecciona el servicio que necesitas:',
      sections: [
        {
          title: '📋 Menú Principal',
          rows: [
            { 
                  id: 'urgencias', 
                  title: '🚨 Urgencias', 
                  description: 'Atención de emergencias' 
                },
                { 
                  id: 'autorizaciones', 
                  title: '📄 Autorizaciones', 
                  description: 'Solicitar autorizaciones' 
                },
                { 
                  id: 'otras_gestiones', 
                  title: '📋 Otras gestiones', 
                  description: 'Más servicios disponibles' 
            }
          ]
        }
      ]
    },
    
    'otras_gestiones_list': {
      title: '📋 Otras Gestiones',
      description: 'Selecciona el trámite que necesitas:',
      sections: [
        {
          title: '📋 Trámites Disponibles',
          rows: [
            { id: 'afiliacion', title: '👤 Afiliación', description: 'Instructivo y requisitos' },
            { id: 'reintegros', title: '💸 Reintegros', description: 'Solicitar y consultar' },
            { id: 'medicamentos', title: '💊 Medicamentos', description: 'Vademécum y farmacias' },
            { id: 'programas', title: '❤️ Programas', description: 'Programas médicos' },
            { id: 'prestadores', title: '🏥 Prestadores', description: 'Listado de prestadores' },
            { id: 'reciprocidad', title: '🤝 Reciprocidad', description: 'Convenios y cobertura' },
            { id: 'soporte_prestador', title: '🧑‍⚕️ Soporte', description: 'Ayuda para prestadores' },
            { id: 'otras_consultas', title: '❓ Consultas', description: 'Otras consultas' }
          ]
        }
      ]
    },

  },
  listResponses: {
    // 🚨 URGENCIAS
    'urgencias': {
      type: 'text',
      message: '🆘 URGENCIAS\n\n📞 0800-888-3226 (ECCO)\n📞 351 4466666\n\n📌 Al momento del llamado, tenga a mano el número de DNI del paciente.\n\n🏠 Médico a domicilio:\nPrestación destinada a consultas médicas generales realizadas en el domicilio del afiliado.\n\n⚠️ Sujeta a disponibilidad. Puede requerir copago y tiene tope mensual y anual.\n\n🔁 Para volver al menú principal, toque "↩️ Volver al Menú" o escriba "Menú".'
    },
    
    // 📄 AUTORIZACIONES - Texto con opciones A-E
    'autorizaciones': {
      type: 'text',
      message: '📄 AUTORIZACIONES\n\nSeleccioná una opción:\nA. 📝 Solicitar Autoriz.\nB. 📦 Seguimiento\nC. ⚠️ Reclamo\nD. 🔎 Revisión\nE. ↩️ Volver al Menú'
    },
    
    // 📝 SOLICITAR AUTORIZACIONES (A)
    'amb_solicitar': {
      type: 'text',
      message: 'Los prestadores ya gestionan las autorizaciones desde el sistema web de la Caja. Al cargar el pedido, se genera un Nº de trámite (ej: 19----). Con ese número podrá consultar el estado en el portal. Si el pedido es de Sanatorio Allende u otro prestador que no opere por sistema, envíenos una foto clara del pedido por este medio.'
    },
    
    // 📦 SEGUIMIENTO (B)
    'amb_seguimiento': {
      type: 'text',
      message: 'Consulte el estado de su autorización en el portal de la Caja ingresando el Nº de trámite: https://autogestion.caja-abogados.org.ar'
    },
    
    // ⚠️ RECLAMO (C)
    'amb_reclamo': {
      type: 'text',
      message: 'El tiempo estimado de resolución de una autorización ambulatoria es de hasta 48 horas hábiles. Si el trámite excede ese plazo, por favor envíenos: • Nº de trámite (ej: 19----) • Nombre del afiliado/paciente • Observaciones (si las hubiera) Importante: Las prácticas de urgencia y/o internación poseen plazos diferenciados.'
    },
    
    // 🔎 REVISIÓN (D)
    'amb_revision': {
      type: 'text',
      message: 'Puede solicitar revisión del trámite en los siguientes casos: • Pedido médico devuelto en el portal (requiere documentación adicional) • Prácticas fuera de convenio (adjuntar informe, estudios previos y presupuesto) • Procedimientos especiales o de alto costo (justificar con documentación) • Errores en la solicitud (adjuntar corrección solicitada por auditoría)'
    },
    
    // ↩️ VOLVER AL MENÚ (E)
    'amb_volver': {
      type: 'text',
      message: '🔙 Regresando al menú principal...',
      followUp: 'demo_list'
    },
    
    // 📋 OTRAS GESTIONES - Submenú implementado como lista interactiva
    'otras_gestiones': {
      type: 'text',
      message: '📋 OTRAS GESTIONES\n\nSeleccioná el trámite que necesitas:',
      followUp: 'otras_gestiones_list'
    },
    
    // 👤 AFILIACIÓN - Otras Gestiones
    'afiliacion': {
      type: 'text_with_url',
      message: '👤 AFILIACIÓN\n\n📄 Instructivo de afiliación:\n\n✉️ enviar formularios a serviciomedico.afil@caja-abogados.com.ar\n\n📞 351 4235900 int. 103',
      url: 'https://descargar.caja-abogados.org.ar/servicio-medico/instructivo-de-afiliacion/',
      url_text: '📄 Ver Instructivo de Afiliación'
    },
    
    // 💸 REINTEGROS - Otras Gestiones
    'reintegros': {
      type: 'text',
      message: '💸 REINTEGROS\n\nPor favor, indique qué desea hacer:\n🔸 A. Solicitar un reintegro\n🔸 B. Consultar el estado de un reintegro ya presentado\n🔸 C. Conocer los casos posibles de un reintegro\n🔸 D. Consultar proveedores por especialidad\n🔸 E. Volver al Menú'
    },
    
    // 💊 MEDICAMENTOS - Otras Gestiones
    'medicamentos': {
      type: 'text',
      message: '💊 MEDICAMENTOS\n\nPor favor, indique qué desea hacer:\n🔸 A. Buscar en Vademécum\n🔸 B. Consultar farmacias prestadoras\n🔸 C. Información sobre recetas\n🔸 D. Cobertura fuera del vademécum\n🔸 E. Volver al Menú'
    },
    
    // ❤️ PROGRAMAS - Otras Gestiones (temporal)
    'programas': {
      type: 'text',
      message: '❤️ PROGRAMAS\n\n📋 Información detallada próximamente disponible.\n\n📞 Para consultas: 351 4235900 int. 103\n\n✉️ serviciomedico@caja-abogados.com.ar'
    },
    
    // 🏥 PRESTADORES - Otras Gestiones (temporal)
    'prestadores': {
      type: 'text',
      message: '🏥 PRESTADORES\n\n📋 Información detallada próximamente disponible.\n\n📞 Para consultas: 351 4235900 int. 103\n\n✉️ serviciomedico@caja-abogados.com.ar'
    },
    
    // 🤝 RECIPROCIDAD - Otras Gestiones (temporal)
    'reciprocidad': {
      type: 'text',
      message: '🤝 RECIPROCIDAD\n\n📋 Información detallada próximamente disponible.\n\n📞 Para consultas: 351 4235900 int. 103\n\n✉️ serviciomedico@caja-abogados.com.ar'
    },
    
    // 🧑‍⚕️ SOPORTE PRESTADOR - Otras Gestiones (temporal)
    'soporte_prestador': {
      type: 'text',
      message: '🧑‍⚕️ SOPORTE PRESTADOR\n\n📋 Información detallada próximamente disponible.\n\n📞 Para consultas: 351 4235900 int. 103\n\n✉️ serviciomedico@caja-abogados.com.ar'
    },
    
    // ❓ OTRAS CONSULTAS - Otras Gestiones (temporal)
    'otras_consultas': {
      type: 'text',
      message: '❓ OTRAS CONSULTAS\n\n📋 Información detallada próximamente disponible.\n\n📞 Para consultas: 351 4235900 int. 103\n\n✉️ serviciomedico@caja-abogados.com.ar'
    },
    
    // 📝 SOLICITAR REINTEGRO (Opción A)
    'reintegros_solicitar': {
      type: 'text',
      message: '📝 SOLICITAR REINTEGRO\n\n📋 Documentación requerida:\n• Comprobante original de pago\n• Pedido médico/receta correspondiente\n• CBU de cuenta bancaria a nombre del titular\n• CUIT del titular\n• Datos de contacto actualizados (teléfono y correo electrónico)\n• Documentación específica para cada tipo de reintegro\n\n📌 Entrega de documentación:\n🏠 Servicio médico de Caja de Abogados de Cba\n📍 Domicilio: 27 de abril 842 - Córdoba\n\n📞 Asesoramiento: 351 4235900 int. 116\n✉️ serviciomedico@caja-abogados.com.ar\n📩 Con copia a: psaad@caja-abogados.com.ar'
    },
    
    // 🔍 CONSULTAR ESTADO (Opción B)
    'reintegros_consultar': {
      type: 'text',
      message: '🔍 CONSULTAR ESTADO DE REINTEGRO\n\n📋 Puede consultar el estado de su reintegro:\n\n🏠 En forma presencial en el Servicio de Salud\n✉️ Por correo electrónico:\n   • serviciomedico@caja-abogados.com.ar\n   • Con copia a: psaad@caja-abogados.com.ar\n\n📞 Teléfono: 351 4235900 int. 116'
    },
    
    // ❓ CASOS POSIBLES (Opción C)
    'reintegros_casos': {
      type: 'text_with_url',
      message: '❓ CASOS POSIBLES DE REINTEGRO\n\n📄 Para conocer los casos posibles de reintegro, consulte el artículo 32 del reglamento:\n\n📞 Teléfono: 351 4235900 int. 116',
      url: 'https://www.caja-abogados.org.ar/servicio-medico/reglamento-2013/',
      url_text: '📄 Ver Artículo 32 - Reglamento 2013'
    },
    
    // 🏥 CONSULTAR PROVEEDORES (Opción D)
    'reintegros_proveedores': {
      type: 'text',
      message: '🏥 CONSULTAR PROVEEDORES POR ESPECIALIDAD\n\n📋 Para solicitar listado de proveedores:\n\n✉️ serviciomedico@caja-abogados.com.ar\n📩 Con copia a: psaad@caja-abogados.com.ar\n\n📞 Teléfono: 351 4235900 int. 116'
    },
    
    // ↩️ VOLVER AL MENÚ (Opción E)
    'reintegros_volver': {
      type: 'text',
      message: '🔙 Regresando al menú principal...',
      followUp: 'demo_list'
    },
    
    // 🔍 BUSCAR EN VADEMÉCUM (Opción A)
    'medicamentos_vademecum': {
      type: 'text_with_url',
      message: '🔍 BUSCAR EN VADEMÉCUM\n\n📋 Consulte los medicamentos cubiertos por la Caja de Abogados:\n\n📞 Para consultas: 351 4235900 int. 103',
      url: 'https://autogestion.caja-abogados.org.ar/agconsultavademecum.aspx',
      url_text: '🔍 Consultar Vademécum Online'
    },
    
    // 💊 FARMACIAS PRESTADORAS (Opción B)
    'medicamentos_farmacias': {
      type: 'text_with_url',
      message: '💊 FARMACIAS PRESTADORAS\n\n🏪 Consulte las farmacias adheridas donde puede retirar sus medicamentos MEDICAMENTOS:\n\n📞 Para consultas: 351 4235900 int. 103',
      url: 'https://autogestion.caja-abogados.org.ar/agconsultafarmacias.aspx',
      url_text: '🏪 Ver Farmacias Prestadoras'
    },
    
    // 📜 INFORMACIÓN SOBRE RECETAS (Opción C)
    'medicamentos_recetas': {
      type: 'text',
      message: '📜 INFORMACIÓN SOBRE RECETAS\n\n📋 Recetas válidas:\n• Manuscritas o digitales\n• Máximo 2 medicamentos por receta\n• Máximo 2 cajas por medicamento\n\n⚠️ Datos completos obligatorios:\n• Nombre del medicamento\n• Concentración y dosis\n• Cantidad solicitada\n• Firma del médico\n• Sello del consultorio\n\n📞 Para consultas: 351 4235900 int. 103'
    },
    
    // 🧾 COBERTURA FUERA DEL VADEMÉCUM (Opción D)
    'medicamentos_cobertura': {
      type: 'text',
      message: '🧾 COBERTURA FUERA DEL VADEMÉCUM\n\n📋 Para medicamentos no incluidos en el vademécum:\n\n📄 Requisitos:\n• Justificación médica detallada\n• Informe clínico completo\n• Estudios complementarios\n• Presupuesto del medicamento\n\n📌 Presentación:\n• Presencial: Servicio Médico\n• Email: serviciomedico@caja-abogados.com.ar\n\n⏰ Plazo de evaluación: 15 días hábiles\n\n📞 Para consultas: 351 4235900 int. 103'
    },
    
    // ↩️ VOLVER AL MENÚ (Opción E)
    'medicamentos_volver': {
      type: 'text',
      message: '🔙 Regresando al menú principal...',
      followUp: 'demo_list'
    }
  },
  submenuResponses: {}
  };
}

// Guardar configuración en archivo
async function saveConfig(config) {
  try {
    await ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    console.log('✅ Configuración guardada en:', CONFIG_FILE);
  } catch (error) {
    console.error('❌ Error guardando configuración:', error);
    throw error;
  }
}

// Obtener respuesta del bot
function getBotResponse(key, config) {
  // Buscar en responses
  if (config.responses && config.responses[key]) {
    return config.responses[key];
  }
  
  // Buscar en listResponses
  if (config.listResponses && config.listResponses[key]) {
    return config.listResponses[key];
  }
  
  // Buscar en submenuResponses
  if (config.submenuResponses && config.submenuResponses[key]) {
    return config.submenuResponses[key];
  }
  
  return null;
}

// Obtener lista de configuración
function getList(key, config) {
  if (config.lists && config.lists[key]) {
    return config.lists[key];
  }
  return null;
}

// Obtener submenú
function getSubmenu(key, config) {
  if (config.submenuResponses && config.submenuResponses[key]) {
    return config.submenuResponses[key];
  }
  return null;
}

// Cargar estadísticas
async function loadStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      totalMessages: 0,
      uniqueUsers: 0,
      startDate: new Date().toISOString()
    };
  }
}

// Guardar estadísticas
async function saveStats(stats) {
  try {
    await ensureConfigDir();
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error guardando estadísticas:', error);
  }
}

// Crear rutas de administración
function createAdminRoutes() {
  const router = express.Router();
  
  // Servir archivos estáticos
  router.use(express.static(path.join(__dirname, '../../admin')));
  
  // API para obtener configuración
  router.get('/api/config', async (req, res) => {
    try {
      const config = await loadConfig();
      res.json(config);
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      res.status(500).json({ error: 'Error cargando configuración' });
    }
  });
  
  // API para guardar configuración
  router.post('/api/config', async (req, res) => {
    try {
      await saveConfig(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      res.status(500).json({ error: 'Error guardando configuración' });
    }
  });
  
  // API para obtener estadísticas
  router.get('/api/stats', async (req, res) => {
    try {
      const stats = await loadStats();
      res.json(stats);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      res.status(500).json({ error: 'Error cargando estadísticas' });
    }
  });
  
  // API para refrescar caché
  router.post('/api/refresh', async (req, res) => {
    try {
      // Forzar regeneración del archivo de configuración
      const config = getCompleteConfig();
      await saveConfig(config);
      res.json({ success: true, message: 'Caché refrescado' });
    } catch (error) {
      console.error('❌ Error refrescando caché:', error);
      res.status(500).json({ error: 'Error refrescando caché' });
    }
  });
  
  return router;
}

module.exports = {
  createAdminRoutes,
  loadConfig,
  saveConfig,
  getBotResponse,
  getList,
  getSubmenu,
  loadStats,
  saveStats
};
