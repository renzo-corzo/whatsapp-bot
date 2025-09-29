require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const WhatsAppClient = require('./whatsappClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('combined')); // Logger
app.use(express.json()); // Para parsear JSON

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
try {
  whatsappClient = new WhatsAppClient();
  console.log('✅ Cliente de WhatsApp inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando cliente de WhatsApp:', error.message);
  console.error('🔧 Asegúrate de configurar las variables de entorno en el archivo .env');
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
  
  // Convertir número al formato correcto
  const formattedNumber = formatArgentineNumber(from);
  console.log(`📱 Número original: ${from}, formato correcto: ${formattedNumber}`);
  
  // Respuestas especiales para ciertos comandos
  if (textBody === 'hola' || textBody === 'hello' || textBody === 'hi') {
    await whatsappClient.sendText(
      formattedNumber,
      '¡Hola! 👋 Bienvenido al bot de WhatsApp. Te voy a enviar un menú de opciones para que puedas explorar.'
    );
    
    // Enviar lista después del saludo
    setTimeout(async () => {
      await whatsappClient.sendDemoList(formattedNumber);
    }, 1000);
    
  } else if (textBody === 'menu' || textBody === 'opciones') {
    await whatsappClient.sendDemoList(formattedNumber);
    
  } else {
    // Para cualquier otro mensaje, enviar la lista de opciones
    await whatsappClient.sendText(
      formattedNumber,
      'Te entiendo. Aquí tienes algunas opciones que puedo ofrecerte:'
    );
    
    setTimeout(async () => {
      await whatsappClient.sendDemoList(formattedNumber);
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
    
    // Convertir número al formato correcto
    const formattedNumber = formatArgentineNumber(from);
    console.log(`📱 Respuesta a número: ${from} → ${formattedNumber}`);
    
    // Responder según la opción seleccionada
    let response = '';
    switch (selectedId) {
      case 'info_general':
        response = `✅ Has seleccionado: "${selectedTitle}"\n\n🏢 Somos una empresa dedicada a brindar los mejores servicios digitales. Estamos aquí para ayudarte con todas tus consultas y necesidades.\n\n¿Te gustaría conocer algo específico?`;
        break;
        
      case 'soporte_tecnico':
        response = `✅ Has seleccionado: "${selectedTitle}"\n\n🔧 Nuestro equipo de soporte técnico está disponible para ayudarte.\n\nPor favor, describe tu problema y te asistiremos lo antes posible.`;
        break;
        
      case 'consulta_cuenta':
        response = `✅ Has seleccionado: "${selectedTitle}"\n\n👤 Para consultas de cuenta, necesitaríamos verificar tu identidad.\n\nPor favor, proporciona tu número de cuenta o identificación.`;
        break;
        
      case 'horarios_atencion':
        response = `✅ Has seleccionado: "${selectedTitle}"\n\n🕐 Nuestros horarios de atención son:\n• Lunes a Viernes: 8:00 AM - 6:00 PM\n• Sábados: 9:00 AM - 2:00 PM\n• Domingos: Cerrado\n\n⏰ Zona horaria: UTC-5`;
        break;
        
      case 'contactar_humano':
        response = `✅ Has seleccionado: "${selectedTitle}"\n\n👨‍💼 Te conectaremos con uno de nuestros agentes humanos.\n\nPor favor, espera un momento mientras transferimos tu consulta...`;
        break;
        
      default:
        response = `✅ Has seleccionado: "${selectedTitle}"\n\nGracias por tu selección. ¿En qué más puedo ayudarte?`;
    }
    
    await whatsappClient.sendText(formattedNumber, response);
    
    // Después de 3 segundos, ofrecer el menú nuevamente
    setTimeout(async () => {
      await whatsappClient.sendText(
        formattedNumber,
        '¿Te gustaría ver otras opciones? Escribe "menu" para ver el menú completo.'
      );
    }, 3000);
    
  } else {
    console.log(`ℹ️ Tipo de interacción no manejada: ${message.interactive.type}`);
    const formattedNumber = formatArgentineNumber(from);
    await whatsappClient.sendText(
      formattedNumber,
      'Interacción recibida, pero no pude procesarla correctamente.'
    );
  }
}

/**
 * Maneja respuestas de botones (si los implementas en el futuro)
 * @param {Object} message - Mensaje de botón
 * @param {string} from - Número del remitente
 */
async function handleButtonMessage(message, from) {
  const buttonReply = message.button;
  console.log(`🔘 Botón presionado: ${buttonReply.payload} - ${buttonReply.text}`);
  
  const formattedNumber = formatArgentineNumber(from);
  await whatsappClient.sendText(
    formattedNumber,
    `Has presionado el botón: "${buttonReply.text}"`
  );
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
    
    if (!whatsappClient) {
      return res.status(500).json({
        error: 'Cliente de WhatsApp no inicializado. Revisa las variables de entorno.'
      });
    }
    
    console.log(`🚀 Enviando demo a: ${to}`);
    
    const result = await whatsappClient.sendDemoList(to);
    
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
 * GET / - Endpoint raíz con información del bot
 */
app.get('/', (req, res) => {
  res.json({
    message: '🤖 Bot de WhatsApp funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      webhook_verification: 'GET /webhook',
      webhook_messages: 'POST /webhook',
      demo: 'GET /send-demo?to=NUMERO'
    },
    status: whatsappClient ? 'Cliente WhatsApp: ✅ Conectado' : 'Cliente WhatsApp: ❌ Error de configuración'
  });
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
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
