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
              title: 'Productos y Servicios',
              rows: [
                { 
                  id: 'ver_catalogo', 
                  title: '🛒 Ver Catálogo', 
                  description: 'Productos disponibles' 
                },
                { 
                  id: 'precios_planes', 
                  title: '💰 Precios y Planes', 
                  description: 'Tarifas actualizadas' 
                },
                { 
                  id: 'hacer_pedido', 
                  title: '📱 Hacer Pedido', 
                  description: 'Contacto directo' 
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
        'info_general': {
          type: 'text_with_submenu',
          message: '✅ Información General seleccionada.\n\n🏢 Somos una empresa dedicada a brindar los mejores servicios digitales. Estamos aquí para ayudarte con todas tus consultas y necesidades.',
          submenu: 'info_submenu'
        },
        'soporte_tecnico': {
          type: 'text_with_submenu',
          message: '✅ Soporte Técnico seleccionado.\n\n🔧 Nuestro equipo de soporte técnico está disponible para ayudarte.',
          submenu: 'soporte_submenu'
        },
        'consulta_cuenta': {
          type: 'text_with_url',
          message: '✅ Consulta de Cuenta seleccionada.\n\n👤 Para consultas de cuenta, puedes:\n\n1️⃣ Acceder a tu portal: https://mi-empresa.com/portal\n2️⃣ Llamar al: +54 351 123-4567\n3️⃣ Escribir tu consulta aquí',
          url: 'https://mi-empresa.com/portal',
          url_text: '🌐 Acceder al Portal de Cliente'
        },
        'horarios_atencion': {
          type: 'text',
          message: '✅ Horarios de Atención.\n\n🕐 Nuestros horarios de atención son:\n• Lunes a Viernes: 8:00 AM - 6:00 PM\n• Sábados: 9:00 AM - 2:00 PM\n• Domingos: Cerrado\n\n⏰ Zona horaria: UTC-5'
        },
        'contactar_humano': {
          type: 'text_with_buttons',
          message: '✅ Contacto con Agente Humano.\n\n👨‍💼 ¿Cómo prefieres contactarnos?',
          buttons: [
            { id: 'llamada_urgente', title: '📞 Llamada Urgente' },
            { id: 'chat_whatsapp', title: '💬 Chat WhatsApp' },
            { id: 'email_soporte', title: '📧 Email Soporte' }
          ]
        },
        
        // NUEVOS EJEMPLOS PRÁCTICOS
        'ver_catalogo': {
          type: 'text_with_url',
          message: '🛒 Catálogo de Productos\n\n📋 Tenemos una amplia variedad de productos:\n\n• 📱 Smartphones última generación\n• 💻 Laptops y computadoras\n• 🎧 Accesorios tecnológicos\n• 📺 Smart TVs y entretenimiento\n\n💡 Ofertas especiales disponibles',
          url: 'https://mi-tienda.com/catalogo',
          url_text: '🛒 Ver Catálogo Completo'
        },
        
        'precios_planes': {
          type: 'text_with_buttons',
          message: '💰 Precios y Planes 2024\n\n📊 Selecciona qué información necesitas:',
          buttons: [
            { id: 'planes_basicos', title: '🥉 Planes Básicos' },
            { id: 'planes_premium', title: '🥇 Planes Premium' },
            { id: 'ofertas_especiales', title: '🎁 Ofertas' }
          ]
        },
        
        'hacer_pedido': {
          type: 'text_with_url',
          message: '📱 Hacer tu Pedido\n\n🚀 ¡Es muy fácil!\n\n1️⃣ Elige tus productos\n2️⃣ Envíanos tu lista\n3️⃣ Confirmamos disponibilidad\n4️⃣ Coordinamos entrega\n\n💬 Contáctanos directamente:',
          url: 'https://wa.me/543515747073?text=Hola,%20quiero%20hacer%20un%20pedido',
          url_text: '💬 WhatsApp Directo'
        }
      },
      
      // Submenús para navegación por niveles
      submenus: {
        'info_submenu': {
          title: '📍 Información Detallada',
          description: '¿Qué información específica necesitas?',
          sections: [
            {
              title: 'Sobre Nosotros',
              rows: [
                { id: 'historia_empresa', title: '📜 Historia de la Empresa', description: 'Conoce nuestros orígenes' },
                { id: 'mision_vision', title: '🎯 Misión y Visión', description: 'Nuestros valores y objetivos' },
                { id: 'equipo_trabajo', title: '👥 Nuestro Equipo', description: 'Conoce a nuestro equipo' }
              ]
            },
            {
              title: 'Servicios',
              rows: [
                { id: 'lista_servicios', title: '📋 Lista de Servicios', description: 'Todos nuestros servicios' },
                { id: 'precios_tarifas', title: '💰 Precios y Tarifas', description: 'Información de costos' }
              ]
            },
            {
              title: 'Navegación',
              rows: [
                { id: 'volver_menu_principal', title: '🔙 Volver al Menú Principal', description: 'Regresar al inicio' }
              ]
            }
          ]
        },
        
        'soporte_submenu': {
          title: '🔧 Tipos de Soporte',
          description: '¿Qué tipo de ayuda necesitas?',
          sections: [
            {
              title: 'Soporte Técnico',
              rows: [
                { id: 'problema_conexion', title: '🌐 Problemas de Conexión', description: 'Internet, WiFi, red' },
                { id: 'problema_software', title: '💻 Problemas de Software', description: 'Aplicaciones, programas' },
                { id: 'problema_hardware', title: '🔧 Problemas de Hardware', description: 'Equipos, dispositivos' }
              ]
            },
            {
              title: 'Soporte Comercial',
              rows: [
                { id: 'cambio_plan', title: '📈 Cambiar Plan', description: 'Upgrade o downgrade' },
                { id: 'facturacion', title: '🧾 Consultas de Facturación', description: 'Facturas, pagos' }
              ]
            },
            {
              title: 'Navegación',
              rows: [
                { id: 'volver_menu_principal', title: '🔙 Volver al Menú Principal', description: 'Regresar al inicio' }
              ]
            }
          ]
        }
      },
      
      // Respuestas para botones y opciones de submenús
      submenuResponses: {
        // Respuestas para botones de precios
        'planes_basicos': {
          type: 'text_with_url',
          message: '🥉 Planes Básicos\n\n💰 Opciones económicas:\n\n📦 STARTER: $1,500/mes\n• 10GB almacenamiento\n• Soporte por email\n• 1 usuario\n\n📦 BÁSICO: $2,500/mes\n• 50GB almacenamiento\n• Soporte telefónico\n• 3 usuarios\n\n📋 Ver detalles completos:',
          url: 'https://mi-empresa.com/planes-basicos',
          url_text: '📋 Ver Planes Básicos'
        },
        
        'planes_premium': {
          type: 'text_with_url',
          message: '🥇 Planes Premium\n\n⭐ Lo mejor para tu negocio:\n\n🚀 PROFESIONAL: $5,500/mes\n• 200GB almacenamiento\n• Soporte 24/7\n• 10 usuarios\n• Backup automático\n\n🏆 EMPRESARIAL: $9,500/mes\n• Almacenamiento ilimitado\n• Soporte dedicado\n• Usuarios ilimitados\n• Funciones avanzadas\n\n💎 Ver todos los beneficios:',
          url: 'https://mi-empresa.com/planes-premium',
          url_text: '💎 Ver Planes Premium'
        },
        
        'ofertas_especiales': {
          type: 'text_with_buttons',
          message: '🎁 Ofertas Especiales\n\n🔥 ¡Aprovecha estas promociones limitadas!\n\n🎯 ¿Qué tipo de oferta te interesa?',
          buttons: [
            { id: 'descuento_nuevos', title: '🆕 Nuevos Clientes' },
            { id: 'upgrade_gratis', title: '⬆️ Upgrade Gratis' },
            { id: 'paquetes_combo', title: '📦 Paquetes Combo' }
          ]
        },
        
        // Respuestas para ofertas específicas
        'descuento_nuevos': {
          type: 'text_with_url',
          message: '🆕 Oferta Nuevos Clientes\n\n🎉 ¡Bienvenido!\n\n💥 50% OFF primer mes\n💥 Setup gratuito (valor $500)\n💥 Soporte premium incluido\n\n⏰ Oferta válida hasta fin de mes\n\n🚀 ¡Aprovecha ahora!',
          url: 'https://wa.me/543515747073?text=Quiero%20la%20oferta%20nuevos%20clientes',
          url_text: '🚀 Quiero esta Oferta'
        },
        
        'llamada_urgente': {
          type: 'text_with_url',
          message: '📞 Llamada Urgente\n\n🚨 Para emergencias y consultas urgentes:\n\n📱 Línea directa: +54 351 123-4567\n⏰ Disponible 24/7\n🔧 Soporte técnico inmediato\n\n¡Llamanos ahora!',
          url: 'tel:+543511234567',
          url_text: '📞 Llamar Ahora'
        },
        
        'chat_whatsapp': {
          type: 'text_with_url',
          message: '💬 Chat WhatsApp\n\n📱 Habla directamente con nuestro equipo:\n\n✅ Respuesta inmediata\n✅ Envío de archivos\n✅ Seguimiento personalizado\n\n¡Escríbenos!',
          url: 'https://wa.me/543515747073?text=Hola,%20necesito%20ayuda',
          url_text: '💬 Abrir Chat'
        },
        
        'email_soporte': {
          type: 'text_with_url',
          message: '📧 Email Soporte\n\n✉️ Para consultas detalladas:\n\n📮 soporte@mi-empresa.com\n⏱️ Respuesta en 2-4 horas\n📎 Puedes adjuntar archivos\n\n¡Escríbenos!',
          url: 'mailto:soporte@mi-empresa.com?subject=Consulta%20desde%20WhatsApp',
          url_text: '📧 Enviar Email'
        },
        
        // Respuestas para problemas de soporte técnico
        'problema_conexion': {
          type: 'text_with_buttons',
          message: '🌐 Problemas de Conexión\n\nVamos a ayudarte paso a paso. ¿Cuál es tu situación específica?',
          buttons: [
            { id: 'sin_internet', title: '❌ Sin Internet' },
            { id: 'internet_lento', title: '🐌 Internet Lento' },
            { id: 'wifi_problemas', title: '📶 Problemas WiFi' }
          ]
        },
        
        'problema_software': {
          type: 'text_with_buttons',
          message: '💻 Problemas de Software\n\n¿Qué tipo de problema tienes con el software?',
          buttons: [
            { id: 'app_no_abre', title: '🚫 App no Abre' },
            { id: 'app_lenta', title: '🐌 App Lenta' },
            { id: 'error_mensaje', title: '⚠️ Mensaje Error' }
          ]
        },
        
        'problema_hardware': {
          type: 'text_with_buttons',
          message: '🔧 Problemas de Hardware\n\n¿Qué dispositivo tiene problemas?',
          buttons: [
            { id: 'computadora', title: '💻 Computadora' },
            { id: 'telefono', title: '📱 Teléfono' },
            { id: 'tablet', title: '📱 Tablet' }
          ]
        },
        
        // Respuestas específicas para problemas de conexión
        'sin_internet': {
          type: 'text',
          message: '❌ Sin Internet - Solución\n\n🔧 Pasos a seguir:\n\n1️⃣ Verifica que el cable esté conectado\n2️⃣ Reinicia el módem (desconecta 30 seg)\n3️⃣ Reinicia tu dispositivo\n4️⃣ Verifica luces del módem:\n   • Verde = OK\n   • Roja = Problema\n\n📞 Si persiste: +54 351 123-4567'
        },
        
        'internet_lento': {
          type: 'text',
          message: '🐌 Internet Lento - Solución\n\n🔧 Pasos a seguir:\n\n1️⃣ Cierra aplicaciones innecesarias\n2️⃣ Acércate al router WiFi\n3️⃣ Reinicia el módem\n4️⃣ Verifica si otros dispositivos van lentos\n5️⃣ Prueba velocidad: speedtest.net\n\n📊 Velocidad contratada vs real'
        },
        
        'wifi_problemas': {
          type: 'text',
          message: '📶 Problemas WiFi - Solución\n\n🔧 Pasos a seguir:\n\n1️⃣ Olvida y reconecta la red WiFi\n2️⃣ Verifica la contraseña\n3️⃣ Acércate al router\n4️⃣ Reinicia WiFi del dispositivo\n5️⃣ Reinicia el router\n\n🔑 ¿Olvidaste la contraseña? Está en el router'
        },
        
        // Botón para volver al menú principal
        'volver_menu_principal': {
          type: 'list',
          message: 'demo_list'
        }
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
      
      // Si viene configuración de API (token, phoneNumberId), actualizar variables de entorno
      if (config.metaToken || config.phoneNumberId) {
        console.log('🔄 Actualizando configuración de API...');
        
        // Actualizar variables de entorno en tiempo real
        if (config.metaToken) {
          process.env.META_WABA_TOKEN = config.metaToken;
          console.log('✅ META_WABA_TOKEN actualizada');
        }
        
        if (config.phoneNumberId) {
          process.env.PHONE_NUMBER_ID = config.phoneNumberId;
          console.log('✅ PHONE_NUMBER_ID actualizada');
        }
        
        // Reinicializar cliente de WhatsApp con nuevas credenciales
        try {
          const WhatsAppClient = require('../whatsappClient');
          global.whatsappClient = new WhatsAppClient();
          console.log('✅ Cliente de WhatsApp reinicializado con nuevas credenciales');
        } catch (clientError) {
          console.error('⚠️ Error reinicializando cliente:', clientError.message);
        }
        
        res.json({ 
          success: true, 
          message: 'Configuración API actualizada en tiempo real',
          reloaded: true
        });
      } else {
        // Configuración normal (respuestas, listas, etc.)
        await saveConfig(config);
        res.json({ success: true, message: 'Configuración guardada correctamente' });
      }
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

async function getSubmenu(submenuId) {
  try {
    const config = await loadConfig();
    return config.submenus[submenuId] || null;
  } catch (error) {
    console.error('Error obteniendo submenú:', error);
    return null;
  }
}

async function getSubmenuResponse(optionId) {
  try {
    const config = await loadConfig();
    return config.submenuResponses[optionId] || null;
  } catch (error) {
    console.error('Error obteniendo respuesta de submenú:', error);
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
  getSubmenu,
  getSubmenuResponse,
  incrementMessageCount,
  updateUniqueUsers,
  loadConfig,
  saveConfig
};
