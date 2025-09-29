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
    // Configuración por defecto
    const defaultConfig = {
      responses: {
        'hola': {
          type: 'text',
          message: '¡Hola! 👋 Bienvenido al bot de WhatsApp. Te voy a enviar un menú de opciones.',
          followUp: 'demo_list'
        },
        'hello': {
          type: 'text',
          message: '¡Hola! 👋 Bienvenido al bot de WhatsApp. Te voy a enviar un menú de opciones.',
          followUp: 'demo_list'
        },
        'hi': {
          type: 'text',
          message: '¡Hola! 👋 Bienvenido al bot de WhatsApp. Te voy a enviar un menú de opciones.',
          followUp: 'demo_list'
        },
        'menu': {
          type: 'list',
          message: 'demo_list'
        },
        'opciones': {
          type: 'list',
          message: 'demo_list'
        }
      },
      lists: {
        'demo_list': {
          title: '📋 Menú Principal',
          description: 'Selecciona una opción para continuar:',
          sections: [
            {
              title: 'Servicios',
              rows: [
                { 
                  id: 'info_general', 
                  title: '📍 Información General', 
                  description: 'Conoce más sobre nosotros' 
                },
                { 
                  id: 'soporte_tecnico', 
                  title: '🔧 Soporte Técnico', 
                  description: 'Ayuda técnica especializada' 
                },
                { 
                  id: 'consulta_cuenta', 
                  title: '👤 Consulta de Cuenta', 
                  description: 'Información de tu cuenta' 
                }
              ]
            },
            {
              title: 'Contacto',
              rows: [
                { 
                  id: 'horarios_atencion', 
                  title: '🕐 Horarios de Atención', 
                  description: 'Ver horarios disponibles' 
                },
                { 
                  id: 'contactar_humano', 
                  title: '👨‍💼 Hablar con Agente', 
                  description: 'Conectar con persona real' 
                }
              ]
            }
          ]
        }
      },
      listResponses: {
        'info_general': '✅ Información General seleccionada.\n\n🏢 Somos una empresa dedicada a brindar los mejores servicios digitales. Estamos aquí para ayudarte con todas tus consultas y necesidades.\n\n¿Te gustaría conocer algo específico?',
        'soporte_tecnico': '✅ Soporte Técnico seleccionado.\n\n🔧 Nuestro equipo de soporte técnico está disponible para ayudarte.\n\nPor favor, describe tu problema y te asistiremos lo antes posible.',
        'consulta_cuenta': '✅ Consulta de Cuenta seleccionada.\n\n👤 Para consultas de cuenta, necesitaríamos verificar tu identidad.\n\nPor favor, proporciona tu número de cuenta o identificación.',
        'horarios_atencion': '✅ Horarios de Atención.\n\n🕐 Nuestros horarios de atención son:\n• Lunes a Viernes: 8:00 AM - 6:00 PM\n• Sábados: 9:00 AM - 2:00 PM\n• Domingos: Cerrado\n\n⏰ Zona horaria: UTC-5',
        'contactar_humano': '✅ Contacto con Agente Humano.\n\n👨‍💼 Te conectaremos con uno de nuestros agentes humanos.\n\nPor favor, espera un momento mientras transferimos tu consulta...'
      }
    };

    await saveConfig(defaultConfig);
    return defaultConfig;
  }
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

// Cargar estadísticas
async function loadStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Estadísticas por defecto
    return {
      totalMessages: 0,
      uniqueUsers: 0,
      responseTime: '~150ms',
      lastUpdated: new Date().toISOString()
    };
  }
}

// Guardar estadísticas
async function saveStats(stats) {
  try {
    stats.lastUpdated = new Date().toISOString();
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error guardando estadísticas:', error);
  }
}

// Función para crear las rutas de administración
function createAdminRoutes() {
  const router = express.Router();

  // Servir archivos estáticos del portal
  router.use('/admin', express.static(path.join(__dirname, '../../admin')));

  // API: Estado del bot
  router.get('/api/status', (req, res) => {
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // API: Obtener configuración completa
  router.get('/api/config', async (req, res) => {
    try {
      const config = await loadConfig();
      res.json(config);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      res.status(500).json({ error: 'Error cargando configuración' });
    }
  });

  // API: Guardar configuración completa
  router.post('/api/config', async (req, res) => {
    try {
      const config = req.body;
      await saveConfig(config);
      res.json({ success: true, message: 'Configuración guardada correctamente' });
    } catch (error) {
      console.error('Error guardando configuración:', error);
      res.status(500).json({ error: 'Error guardando configuración' });
    }
  });

  // API: Obtener respuestas
  router.get('/api/responses', async (req, res) => {
    try {
      const config = await loadConfig();
      res.json(config.responses || {});
    } catch (error) {
      console.error('Error cargando respuestas:', error);
      res.status(500).json({ error: 'Error cargando respuestas' });
    }
  });

  // API: Guardar respuestas
  router.post('/api/responses', async (req, res) => {
    try {
      const config = await loadConfig();
      config.responses = req.body;
      await saveConfig(config);
      res.json({ success: true, message: 'Respuestas guardadas correctamente' });
    } catch (error) {
      console.error('Error guardando respuestas:', error);
      res.status(500).json({ error: 'Error guardando respuestas' });
    }
  });

  // API: Obtener listas interactivas
  router.get('/api/lists', async (req, res) => {
    try {
      const config = await loadConfig();
      res.json(config.lists || {});
    } catch (error) {
      console.error('Error cargando listas:', error);
      res.status(500).json({ error: 'Error cargando listas' });
    }
  });

  // API: Guardar listas interactivas
  router.post('/api/lists', async (req, res) => {
    try {
      const config = await loadConfig();
      config.lists = req.body;
      await saveConfig(config);
      res.json({ success: true, message: 'Listas guardadas correctamente' });
    } catch (error) {
      console.error('Error guardando listas:', error);
      res.status(500).json({ error: 'Error guardando listas' });
    }
  });

  // API: Obtener estadísticas
  router.get('/api/analytics', async (req, res) => {
    try {
      const stats = await loadStats();
      res.json(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      res.status(500).json({ error: 'Error cargando estadísticas' });
    }
  });

  // API: Actualizar estadísticas
  router.post('/api/analytics', async (req, res) => {
    try {
      const stats = req.body;
      await saveStats(stats);
      res.json({ success: true, message: 'Estadísticas actualizadas' });
    } catch (error) {
      console.error('Error guardando estadísticas:', error);
      res.status(500).json({ error: 'Error guardando estadísticas' });
    }
  });

  // API: Reiniciar configuración a valores por defecto
  router.post('/api/reset', async (req, res) => {
    try {
      // Eliminar archivos de configuración para forzar recreación
      try {
        await fs.unlink(CONFIG_FILE);
        await fs.unlink(STATS_FILE);
      } catch (error) {
        // Los archivos pueden no existir, no es un error
      }
      
      const defaultConfig = await loadConfig();
      res.json({ 
        success: true, 
        message: 'Configuración reiniciada a valores por defecto',
        config: defaultConfig 
      });
    } catch (error) {
      console.error('Error reiniciando configuración:', error);
      res.status(500).json({ error: 'Error reiniciando configuración' });
    }
  });

  return router;
}

// Funciones de utilidad para usar en el bot principal
async function getBotResponse(command) {
  try {
    const config = await loadConfig();
    return config.responses[command.toLowerCase()] || null;
  } catch (error) {
    console.error('Error obteniendo respuesta:', error);
    return null;
  }
}

async function getBotList(listId) {
  try {
    const config = await loadConfig();
    return config.lists[listId] || null;
  } catch (error) {
    console.error('Error obteniendo lista:', error);
    return null;
  }
}

async function getListResponse(optionId) {
  try {
    const config = await loadConfig();
    return config.listResponses[optionId] || null;
  } catch (error) {
    console.error('Error obteniendo respuesta de lista:', error);
    return null;
  }
}

async function incrementMessageCount() {
  try {
    const stats = await loadStats();
    stats.totalMessages = (stats.totalMessages || 0) + 1;
    await saveStats(stats);
  } catch (error) {
    console.error('Error incrementando contador de mensajes:', error);
  }
}

async function updateUniqueUsers(userId) {
  try {
    const stats = await loadStats();
    const users = stats.users || [];
    
    if (!users.includes(userId)) {
      users.push(userId);
      stats.users = users;
      stats.uniqueUsers = users.length;
      await saveStats(stats);
    }
  } catch (error) {
    console.error('Error actualizando usuarios únicos:', error);
  }
}

module.exports = {
  createAdminRoutes,
  getBotResponse,
  getBotList,
  getListResponse,
  incrementMessageCount,
  updateUniqueUsers,
  loadConfig,
  saveConfig
};
