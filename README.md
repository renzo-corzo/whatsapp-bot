# 🤖 Bot de WhatsApp con Node.js + Express

Un bot completo de WhatsApp que utiliza la WhatsApp Cloud API de Meta para enviar y recibir mensajes interactivos tipo lista.

## 🚀 Características

- ✅ Webhook para verificación y recepción de mensajes
- ✅ Soporte para mensajes de texto simples
- ✅ Mensajes interactivos tipo lista
- ✅ Procesamiento de respuestas de lista (`list_reply`)
- ✅ Cliente robusto para WhatsApp Cloud API
- ✅ Logger con Morgan
- ✅ Variables de entorno configurables
- ✅ Endpoint de demostración

## 📋 Requisitos previos

1. **Node.js** (versión 18 o superior)
2. **Cuenta de WhatsApp Business API** de Meta
3. **Token de acceso** de WhatsApp Business API
4. **Número de teléfono** configurado en WhatsApp Business

## ⚙️ Configuración

### 1. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus credenciales:

\`\`\`bash
cp env.example .env
\`\`\`

Edita el archivo \`.env\` con tus credenciales reales:

\`\`\`env
META_WABA_TOKEN=tu_token_de_acceso_aqui
VERIFY_TOKEN=tu_token_de_verificacion_personalizado
PHONE_NUMBER_ID=tu_id_de_numero_de_whatsapp_business
PORT=3000
\`\`\`

### 3. Obtener credenciales de Meta

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una aplicación de WhatsApp Business
3. Obtén tu **Access Token** y **Phone Number ID**
4. Configura el webhook URL en Meta

## 🏃‍♂️ Uso

### Desarrollo (con auto-reload)
\`\`\`bash
npm run dev
\`\`\`

### Producción
\`\`\`bash
npm start
\`\`\`

## 🌐 Endpoints

### Webhook de WhatsApp
- **GET** \`/webhook\` - Verificación del webhook de Meta
- **POST** \`/webhook\` - Recepción de mensajes de WhatsApp

### Demostración
- **GET** \`/send-demo?to=NUMERO\` - Envía una lista interactiva de prueba

Ejemplo:
\`\`\`
http://localhost:3000/send-demo?to=521234567890
\`\`\`

### Información del bot
- **GET** \`/\` - Estado del bot y endpoints disponibles

## 📱 Funcionalidades del Bot

### Comandos disponibles:
- **"hola"** o **"hello"** - Saludo personalizado + menú
- **"menu"** u **"opciones"** - Muestra el menú principal
- **Cualquier otro texto** - Envía el menú de opciones

### Opciones del menú interactivo:
1. **ℹ️ Información general** - Información sobre servicios
2. **🔧 Soporte técnico** - Asistencia técnica
3. **👤 Consulta de cuenta** - Estado de cuenta
4. **🕐 Horarios de atención** - Horarios de servicio
5. **👨‍💼 Hablar con agente** - Conexión con humano

## 🛠️ Estructura del proyecto

\`\`\`
├── src/
│   ├── server.js           # Servidor Express principal
│   └── whatsappClient.js   # Cliente para WhatsApp Cloud API
├── package.json            # Dependencias y scripts
├── env.example            # Variables de entorno de ejemplo
└── README.md              # Este archivo
\`\`\`

## 📚 API del Cliente WhatsApp

### \`sendText(to, text)\`
Envía un mensaje de texto simple.

\`\`\`javascript
await whatsappClient.sendText('521234567890', '¡Hola mundo!');
\`\`\`

### \`sendListMessage(options)\`
Envía un mensaje interactivo tipo lista.

\`\`\`javascript
await whatsappClient.sendListMessage({
  to: '521234567890',
  header: 'Encabezado',
  body: 'Texto principal del mensaje',
  footer: 'Pie de página',
  buttonText: 'Ver opciones',
  sections: [
    {
      title: 'Sección 1',
      rows: [
        {
          id: 'opcion_1',
          title: 'Opción 1',
          description: 'Descripción de la opción 1'
        }
      ]
    }
  ]
});
\`\`\`

### \`sendDemoList(to)\`
Envía una lista de demostración predefinida.

\`\`\`javascript
await whatsappClient.sendDemoList('521234567890');
\`\`\`

## 🔧 Configuración del Webhook en Meta

1. Ve a la configuración de tu app en Meta for Developers
2. En la sección de WhatsApp > Configuración
3. Agrega la URL del webhook: \`https://tu-dominio.com/webhook\`
4. Agrega el \`VERIFY_TOKEN\` que configuraste en \`.env\`
5. Suscríbete a los eventos: \`messages\`

## 🚨 Solución de problemas

### Error: "Cliente de WhatsApp no inicializado"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el archivo \`.env\` esté en la raíz del proyecto

### Error: "Webhook verification failed"
- Verifica que el \`VERIFY_TOKEN\` en \`.env\` coincida con el configurado en Meta
- Asegúrate de que la URL del webhook sea accesible públicamente

### Error al enviar mensajes
- Verifica que el \`META_WABA_TOKEN\` sea válido y tenga los permisos necesarios
- Confirma que el \`PHONE_NUMBER_ID\` sea correcto
- Revisa que el número de destino esté en formato internacional (ej: 521234567890)

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Disfruta construyendo tu bot de WhatsApp! 🎉**
