require('dotenv').config();
// 🔄 Submenú Otras Gestiones implementado - versión 1.2
const express = require('express');
const morgan = require('morgan');
const WhatsAppClient = require('./whatsappClient');
const { 
  createAdminRoutes, 
  getBotResponse, 
  getBotList, 
  getListResponse, 
  getSubmenu,
  getSubmenuResponse,
  incrementMessageCount, 
  updateUniqueUsers 
} = require('./admin/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('combined')); // Logger
app.use(express.json()); // Para parsear JSON

// Servir archivos estáticos (incluyendo favicon)
app.use(express.static('public'));

// Ruta específica para favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No Content - evita el error 404
});

// Rutas de administración
app.use('/', createAdminRoutes());

// Función para convertir número argentino al formato correcto
function formatArgentineNumber(phoneNumber) {
  // Si el número empieza con 549 (Argentina con 9), remover el 9
  if (phoneNumber.startsWith('549')) {
    return phoneNumber.replace('549', '54');
  }
  return phoneNumber;
}

// Inicializar cliente de WhatsApp
let whatsappClient;
function initializeWhatsAppClient() {
  try {
    whatsappClient = new WhatsAppClient();
    global.whatsappClient = whatsappClient; // Hacer cliente accesible globalmente
    console.log('✅ Cliente de WhatsApp inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando cliente de WhatsApp:', error.message);
    console.error('🔧 Asegúrate de configurar las variables de entorno en el archivo .env');
    return false;
  }
}

// Inicializar cliente por primera vez
const clientInitialized = initializeWhatsAppClient();
if (!clientInitialized) {
  console.log('⚠️ Cliente de WhatsApp no inicializado - continuando sin él');
}

/**
 * GET /webhook - Verificación del webhook de WhatsApp
 * Meta envía una solicitud GET para verificar el webhook
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Solicitud de verificación recibida:', { mode, token });

  // Verificar que el modo sea 'subscribe' y el token coincida
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Verificación de webhook fallida');
    res.status(403).send('Forbidden');
  }
});

/**
 * POST /webhook - Recibir mensajes de WhatsApp
 * Meta envía los mensajes entrantes a este endpoint
 */
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    
    console.log('📨 Webhook recibido:', JSON.stringify(body, null, 2));

    // Verificar que sea un mensaje de WhatsApp
    if (body.object === 'whatsapp_business_account') {
      
      // Procesar cada entrada (puede haber múltiples)
      for (const entry of body.entry) {
        
        // Procesar cada cambio en la entrada
        for (const change of entry.changes) {
          
          if (change.field === 'messages') {
            const value = change.value;
            
            // Procesar mensajes entrantes
            if (value.messages) {
              for (const message of value.messages) {
                await processIncomingMessage(message, value.contacts?.[0]);
              }
            }
            
            // Procesar cambios de estado de mensaje (opcional)
            if (value.statuses) {
              for (const status of value.statuses) {
                console.log(`📊 Estado del mensaje ${status.id}: ${status.status}`);
              }
            }
          }
        }
      }
    }

    // Siempre responder con 200 para confirmar recepción
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).send('Error interno del servidor');
  }
});

/**
 * Procesa un mensaje entrante de WhatsApp
 * @param {Object} message - Objeto del mensaje de WhatsApp
 * @param {Object} contact - Información del contacto que envió el mensaje
 */
async function processIncomingMessage(message, contact) {
  try {
    const from = message.from;
    const messageId = message.id;
    const timestamp = message.timestamp;
    
    console.log(`📱 Mensaje de ${contact?.profile?.name || from} (${from}):`, {
      id: messageId,
      type: message.type,
      timestamp: new Date(timestamp * 1000).toLocaleString()
    });

    // Verificar que tenemos el cliente inicializado
    if (!whatsappClient) {
      console.error('❌ Cliente de WhatsApp no inicializado');
      return;
    }

    // Procesar diferentes tipos de mensajes
    switch (message.type) {
      case 'text':
        await handleTextMessage(message, from);
        break;
        
      case 'interactive':
        await handleInteractiveMessage(message, from);
        break;
        
      case 'button':
        await handleButtonMessage(message, from);
        break;
        
      default:
        console.log(`ℹ️ Tipo de mensaje no manejado: ${message.type}`);
        await whatsappClient.sendText(
          from, 
          'Lo siento, solo puedo procesar mensajes de texto y opciones de lista por ahora. 😊'
        );
    }
    
  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
  }
}

/**
 * Maneja mensajes de texto simples
 * @param {Object} message - Mensaje de texto
 * @param {string} from - Número del remitente
 */
async function handleTextMessage(message, from) {
  const textBody = message.text.body.toLowerCase().trim();
  
  console.log(`💬 Mensaje de texto: "${textBody}"`);
  
  // Incrementar contador de mensajes
  await incrementMessageCount();
  await updateUniqueUsers(from);
  
  // Convertir número al formato correcto
  const formattedNumber = formatArgentineNumber(from);
  console.log(`📱 Número original: ${from}, formato correcto: ${formattedNumber}`);
  
  // Usar cliente global actualizado
  const currentClient = global.whatsappClient || whatsappClient;
  
  // Buscar respuesta configurada
  const botResponse = await getBotResponse(textBody);
  
  // Manejo especial para opciones de reintegros (A, B, C, D, E)
  if (!botResponse && ['a', 'b', 'c', 'd', 'e'].includes(textBody)) {
    console.log(`💸 Opción de reintegros seleccionada: "${textBody}"`);
    
    let reintegrosResponse;
    switch (textBody) {
      case 'a':
        reintegrosResponse = await getBotResponse('reintegros_solicitar');
        break;
      case 'b':
        reintegrosResponse = await getBotResponse('reintegros_consultar');
        break;
      case 'c':
        reintegrosResponse = await getBotResponse('reintegros_casos');
        break;
      case 'd':
        reintegrosResponse = await getBotResponse('reintegros_proveedores');
        break;
      case 'e':
        reintegrosResponse = await getBotResponse('reintegros_volver');
        break;
    }
    
    if (reintegrosResponse) {
      console.log(`✅ Respuesta de reintegros encontrada para "${textBody}":`, reintegrosResponse);
      
      // Enviar mensaje principal
      await currentClient.sendText(formattedNumber, reintegrosResponse.message);
      
      // Si tiene follow-up (como volver al menú), enviarlo después de un delay
      if (reintegrosResponse.followUp) {
        setTimeout(async () => {
          console.log(`🔍 Procesando followUp de reintegros: ${reintegrosResponse.followUp}`);
          const listData = await getBotList(reintegrosResponse.followUp);
          if (listData) {
            await currentClient.sendListFromConfig(formattedNumber, listData);
            console.log(`✅ Lista de reintegros enviada correctamente`);
          } else {
            console.log(`❌ Lista no encontrada: ${reintegrosResponse.followUp}`);
          }
        }, 1500);
      }
      
      // Si es respuesta con URL, enviarla también
      if (reintegrosResponse.url && reintegrosResponse.url_text) {
        setTimeout(async () => {
          await currentClient.sendTextWithUrl(formattedNumber, reintegrosResponse.url, reintegrosResponse.url_text);
        }, 2000);
      }
      
      return; // Salir de la función para no procesar más
    }
  }
  
  if (botResponse) {
    console.log(`✅ Respuesta encontrada para "${textBody}":`, botResponse);
    
    // Enviar mensaje principal
    await currentClient.sendText(formattedNumber, botResponse.message);
    
    // Si tiene follow-up, enviarlo después de un delay
    if (botResponse.followUp) {
      setTimeout(async () => {
        console.log(`🔍 Procesando followUp: ${botResponse.followUp}`);
        const listData = await getBotList(botResponse.followUp);
        console.log(`📋 Lista encontrada:`, listData ? 'SÍ' : 'NO');
        if (listData) {
          console.log(`📋 Lista título: ${listData.title}`);
          console.log(`📋 Lista secciones: ${listData.sections?.length || 0}`);
          if (listData.sections && listData.sections.length > 0) {
            console.log(`📋 Primera sección: ${JSON.stringify(listData.sections[0])}`);
          }
          await currentClient.sendListFromConfig(formattedNumber, listData);
          console.log(`✅ Lista enviada correctamente`);
        } else {
          console.log(`❌ Lista no encontrada: ${botResponse.followUp}`);
        }
      }, 1500);
    }
    
  } else {
    // Respuesta por defecto: ofrecer menú
    await currentClient.sendText(
      formattedNumber,
      '🤔 No entiendo ese comando. Te muestro las opciones disponibles:'
    );
    
    setTimeout(async () => {
      const demoList = await getBotList('demo_list');
      if (demoList) {
        await currentClient.sendListFromConfig(formattedNumber, demoList);
      }
    }, 500);
  }
}

/**
 * Maneja respuestas de mensajes interactivos (listas)
 * @param {Object} message - Mensaje interactivo
 * @param {string} from - Número del remitente
 */
async function handleInteractiveMessage(message, from) {
  if (message.interactive.type === 'list_reply') {
    const listReply = message.interactive.list_reply;
    const selectedId = listReply.id;
    const selectedTitle = listReply.title;
    
    console.log(`📋 Opción seleccionada: ${selectedId} - ${selectedTitle}`);
    
    // Incrementar contador de mensajes
    await incrementMessageCount();
    
    // Convertir número al formato correcto
    const formattedNumber = formatArgentineNumber(from);
    console.log(`📱 Respuesta a número: ${from} → ${formattedNumber}`);
    
    // Usar cliente global actualizado
    const currentClient = global.whatsappClient || whatsappClient;
    
    // Buscar respuesta configurada para la opción seleccionada
    let response = await getListResponse(selectedId);
    
    // Si no se encuentra en listResponses, buscar en submenuResponses
    if (!response) {
      response = await getSubmenuResponse(selectedId);
    }
    
    if (response) {
      console.log(`✅ Respuesta configurada encontrada para: ${selectedId}`);
      console.log(`📋 Tipo de respuesta: ${response.type}`);
      console.log(`💬 Mensaje: ${response.message?.substring(0, 50)}...`);
      if (response.submenu) {
        console.log(`🔗 Submenú vinculado: ${response.submenu}`);
      }
      await handleComplexResponse(currentClient, formattedNumber, response);
    } else {
      // Respuesta por defecto si no se encuentra configuración
      const defaultResponse = `✅ Has seleccionado: "${selectedTitle}"\n\nGracias por tu selección. ¿En qué más puedo ayudarte?`;
      await currentClient.sendText(formattedNumber, defaultResponse);
    }
    
    // Mensaje automático eliminado - navegación mejorada
    
  } else if (message.interactive.type === 'button_reply') {
    const buttonReply = message.interactive.button_reply;
    const selectedId = buttonReply.id;
    const selectedTitle = buttonReply.title;
    
    console.log(`🔘 Botón presionado: ${selectedId} - ${selectedTitle}`);
    
    // Incrementar contador de mensajes
    await incrementMessageCount();
    
    // Convertir número al formato correcto
    const formattedNumber = formatArgentineNumber(from);
    console.log(`📱 Respuesta a número: ${from} → ${formattedNumber}`);
    
    // Usar cliente global actualizado
    const currentClient = global.whatsappClient || whatsappClient;
    
    // Buscar respuesta configurada para el botón presionado
    let response = await getListResponse(selectedId);
    
    // Si no se encuentra en listResponses, buscar en submenuResponses
    if (!response) {
      response = await getSubmenuResponse(selectedId);
    }
    
    if (response) {
      console.log(`✅ Respuesta configurada encontrada para botón: ${selectedId}`);
      console.log(`📋 Tipo de respuesta: ${response.type}`);
      console.log(`💬 Mensaje: ${response.message?.substring(0, 50)}...`);
      if (response.followUp) {
        console.log(`🔗 FollowUp vinculado: ${response.followUp}`);
      }
      await handleComplexResponse(currentClient, formattedNumber, response);
    } else {
      // Respuesta por defecto si no se encuentra configuración
      const defaultResponse = `✅ Has presionado: "${selectedTitle}"\n\nGracias por tu selección. ¿En qué más puedo ayudarte?`;
      await currentClient.sendText(formattedNumber, defaultResponse);
    }
    
  } else {
    console.log(`ℹ️ Tipo de interacción no manejada: ${message.interactive.type}`);
    const formattedNumber = formatArgentineNumber(from);
    const currentClient = global.whatsappClient || whatsappClient;
    await currentClient.sendText(
      formattedNumber,
      'Interacción recibida, pero no pude procesarla correctamente.'
    );
  }
}

/**
 * Maneja respuestas complejas (con URLs, botones, submenús)
 * @param {Object} client - Cliente de WhatsApp
 * @param {string} to - Número del destinatario
 * @param {Object} response - Configuración de respuesta
 */
async function handleComplexResponse(client, to, response) {
  try {
    // Si es string simple (compatibilidad hacia atrás)
    if (typeof response === 'string') {
      await client.sendText(to, response);
      return;
    }

    // Si es objeto con tipo específico
    switch (response.type) {
      case 'text':
        await client.sendText(to, response.message);
        break;

      case 'text_with_url':
        await client.sendTextWithUrl(to, response.message, response.url, response.url_text);
        break;

      case 'text_with_buttons':
        await client.sendText(to, response.message);
        setTimeout(async () => {
          try {
            await client.sendButtonMessage(to, "Selecciona una opción:", response.buttons);
          } catch (error) {
            console.error('Error enviando botones:', error);
            // Fallback a texto simple
            await client.sendText(to, "Opciones disponibles: " + response.buttons.map(b => b.title).join(', '));
          }
        }, 1000);
        break;

      case 'text_with_submenu':
        console.log(`🔧 Enviando mensaje de submenú para: ${response.submenu}`);
        await client.sendText(to, response.message);
        setTimeout(async () => {
          try {
            console.log(`🔍 Buscando submenú: ${response.submenu}`);
            const submenu = await getSubmenu(response.submenu);
            console.log(`📋 Submenú encontrado:`, submenu ? 'SÍ' : 'NO');
            if (submenu) {
              console.log(`📋 Submenú título: ${submenu.title}`);
              console.log(`📋 Submenú descripción: ${submenu.description}`);
              console.log(`📋 Submenú secciones: ${JSON.stringify(submenu.sections?.map(s => s.title))}`);
            }
            if (submenu) {
              console.log(`📤 Enviando submenú con ${submenu.sections?.length || 0} secciones`);
              await client.sendListFromConfig(to, submenu);
              console.log(`✅ Submenú enviado exitosamente`);
            } else {
              console.log(`❌ Submenú no encontrado: ${response.submenu}`);
              await client.sendText(to, 'Escribe "menu" para ver las opciones disponibles.');
            }
          } catch (error) {
            console.error('❌ Error enviando submenú:', error);
            await client.sendText(to, 'Escribe "menu" para ver las opciones disponibles.');
          }
        }, 1500);
        break;

      default:
        // Fallback para tipos no reconocidos
        await client.sendText(to, response.message || 'Respuesta no disponible');
    }

    // Procesar followUp si existe (después de enviar el mensaje principal)
    if (response.followUp) {
      console.log(`🔄 Procesando followUp: ${response.followUp}`);
      setTimeout(async () => {
        try {
          console.log(`🔍 Buscando lista para followUp: ${response.followUp}`);
          const listData = await getBotList(response.followUp);
          console.log(`📋 Lista encontrada para followUp:`, listData ? 'SÍ' : 'NO');
          if (listData) {
            console.log(`📋 Lista título: ${listData.title}`);
            console.log(`📋 Lista secciones: ${listData.sections?.length || 0}`);
            await client.sendListFromConfig(to, listData);
            console.log(`✅ Lista de followUp enviada exitosamente`);
          } else {
            console.log(`❌ Lista no encontrada para followUp: ${response.followUp}`);
          }
        } catch (error) {
          console.error('❌ Error procesando followUp:', error);
        }
      }, 1500);
    }

  } catch (error) {
    console.error('Error en handleComplexResponse:', error);
    await client.sendText(to, 'Disculpa, hubo un error procesando tu solicitud.');
  }
}

/**
 * Maneja respuestas de botones
 * @param {Object} message - Mensaje de botón
 * @param {string} from - Número del remitente
 */
async function handleButtonMessage(message, from) {
  const buttonReply = message.button;
  console.log(`🔘 Botón presionado: ${buttonReply.payload} - ${buttonReply.text}`);
  
  // Incrementar contador de mensajes
  await incrementMessageCount();
  
  const formattedNumber = formatArgentineNumber(from);
  const currentClient = global.whatsappClient || whatsappClient;
  
  // Buscar respuesta para el botón presionado
  const response = await getSubmenuResponse(buttonReply.payload);
  
  if (response) {
    await handleComplexResponse(currentClient, formattedNumber, response);
  } else {
    await currentClient.sendText(
      formattedNumber,
      `Has presionado el botón: "${buttonReply.text}"`
    );
  }
}

/**
 * GET /send-demo - Endpoint para enviar lista de demostración
 * Uso: GET /send-demo?to=521234567890
 */
app.get('/send-demo', async (req, res) => {
  try {
    const to = req.query.to;
    
    if (!to) {
      return res.status(400).json({
        error: 'Se requiere el parámetro "to" con el número de teléfono',
        example: '/send-demo?to=521234567890'
      });
    }
    
    // Usar cliente global si está disponible (actualizado dinámicamente)
    const currentClient = global.whatsappClient || whatsappClient;
    
    if (!currentClient) {
      return res.status(500).json({
        error: 'Cliente de WhatsApp no inicializado. Revisa las variables de entorno.'
      });
    }
    
    console.log(`🚀 Enviando demo a: ${to}`);
    
    const result = await currentClient.sendDemoList(to);
    
    res.json({
      success: true,
      message: `Lista de demostración enviada a ${to}`,
      whatsapp_response: result
    });
    
  } catch (error) {
    console.error('❌ Error enviando demo:', error);
    res.status(500).json({
      error: 'Error enviando mensaje de demostración',
      details: error.message
    });
  }
});

/**
 * GET / - Página de inicio con información del bot
 */
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🤖 WhatsApp Bot - Panel de Control</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                margin: 0; 
                padding: 40px 20px; 
                min-height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
            }
            .container { 
                text-align: center; 
                background: rgba(255,255,255,0.1); 
                backdrop-filter: blur(10px); 
                padding: 40px; 
                border-radius: 20px; 
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                max-width: 600px;
            }
            h1 { font-size: 3rem; margin-bottom: 20px; }
            .status { 
                padding: 15px; 
                margin: 20px 0; 
                border-radius: 10px; 
                background: rgba(37, 211, 102, 0.2); 
                border: 1px solid rgba(37, 211, 102, 0.3); 
            }
            .btn { 
                display: inline-block; 
                padding: 15px 30px; 
                margin: 10px; 
                background: rgba(37, 211, 102, 0.9); 
                color: white; 
                text-decoration: none; 
                border-radius: 10px; 
                font-weight: bold; 
                transition: all 0.3s ease;
            }
            .btn:hover { 
                background: rgba(37, 211, 102, 1); 
                transform: translateY(-2px); 
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .endpoint {
                background: rgba(255,255,255,0.1);
                padding: 10px;
                margin: 5px 0;
                border-radius: 5px;
                font-family: monospace;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 WhatsApp Bot</h1>
            <div class="status">
                <strong>Estado:</strong> ${whatsappClient ? '✅ Bot Online y Funcionando' : '❌ Error de Configuración'}
            </div>
            
            <p><strong>Versión:</strong> 1.0.0</p>
            
            <h3>🛠️ Panel de Administración</h3>
            <a href="/admin" class="btn">🎛️ Abrir Portal de Administración</a>
            
            <h3>📡 Endpoints Disponibles</h3>
            <div class="endpoint">GET /webhook - Verificación de webhook</div>
            <div class="endpoint">POST /webhook - Recibir mensajes</div>
            <div class="endpoint">GET /send-demo?to=NUMERO - Enviar demo</div>
            <div class="endpoint">GET /admin - Portal de administración</div>
            
            <h3>🧪 Probar Bot</h3>
            <a href="/send-demo?to=543515747073" class="btn">📱 Enviar Mensaje de Prueba</a>
            
            <p style="margin-top: 30px; opacity: 0.8;">
                <small>💡 Usa el portal de administración para crear y editar respuestas del bot</small>
            </p>
        </div>
    </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado correctamente');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🧪 Demo URL: http://localhost:${PORT}/send-demo?to=NUMERO`);
  console.log('📋 Variables de entorno requeridas:');
  console.log('   - META_WABA_TOKEN:', process.env.META_WABA_TOKEN ? '✅ Configurada' : '❌ Faltante');
  console.log('   - VERIFY_TOKEN:', process.env.VERIFY_TOKEN ? '✅ Configurada' : '❌ Faltante');
  console.log('   - PHONE_NUMBER_ID:', process.env.PHONE_NUMBER_ID ? '✅ Configurada' : '❌ Faltante');
  console.log('📖 Usa "npm run dev" para desarrollo con auto-reload');
  console.log('🔄 Deploy forzado - Debugging submenús automáticos v2');
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
