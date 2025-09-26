const axios = require('axios');

class WhatsAppClient {
  constructor() {
    this.accessToken = process.env.META_WABA_TOKEN;
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.baseURL = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('Faltan variables de entorno: META_WABA_TOKEN y PHONE_NUMBER_ID son requeridas');
    }
  }

  /**
   * Envía un mensaje de texto simple
   * @param {string} to - Número de teléfono del destinatario (formato: 521234567890)
   * @param {string} text - Texto del mensaje
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendText(to, text) {
    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: text
      }
    };

    try {
      const response = await axios.post(this.baseURL, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Mensaje de texto enviado a ${to}:`, text);
      return response.data;
    } catch (error) {
      console.error('❌ Error enviando mensaje de texto:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Envía un mensaje de lista interactiva
   * @param {Object} options - Opciones del mensaje de lista
   * @param {string} options.to - Número de teléfono del destinatario
   * @param {string} options.header - Texto del encabezado
   * @param {string} options.body - Texto principal del mensaje
   * @param {string} options.footer - Texto del pie de página
   * @param {string} options.buttonText - Texto del botón para abrir la lista
   * @param {Array} options.sections - Array de secciones con sus opciones
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendListMessage({ to, header, body, footer, buttonText, sections }) {
    // Validar que las secciones tengan el formato correcto
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      throw new Error('Se requiere al menos una sección con opciones');
    }

    // Validar estructura de secciones
    sections.forEach((section, index) => {
      if (!section.title || !section.rows || !Array.isArray(section.rows)) {
        throw new Error(`La sección ${index} debe tener título y filas`);
      }
      
      section.rows.forEach((row, rowIndex) => {
        if (!row.id || !row.title) {
          throw new Error(`La fila ${rowIndex} de la sección ${index} debe tener id y title`);
        }
      });
    });

    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "list",
        header: header ? {
          type: "text",
          text: header
        } : undefined,
        body: {
          text: body
        },
        footer: footer ? {
          text: footer
        } : undefined,
        action: {
          button: buttonText || "Ver opciones",
          sections: sections
        }
      }
    };

    // Limpiar campos undefined
    if (!payload.interactive.header) {
      delete payload.interactive.header;
    }
    if (!payload.interactive.footer) {
      delete payload.interactive.footer;
    }

    try {
      const response = await axios.post(this.baseURL, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Mensaje de lista enviado a ${to}:`, body);
      return response.data;
    } catch (error) {
      console.error('❌ Error enviando mensaje de lista:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Crea un mensaje de lista de ejemplo para demostración
   * @param {string} to - Número de teléfono del destinatario
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendDemoList(to) {
    const demoOptions = {
      to: to,
      header: "🤖 Bot de WhatsApp",
      body: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      footer: "Selecciona una opción de la lista",
      buttonText: "Ver opciones",
      sections: [
        {
          title: "📋 Servicios principales",
          rows: [
            {
              id: "info_general",
              title: "ℹ️ Información general",
              description: "Conoce más sobre nuestros servicios"
            },
            {
              id: "soporte_tecnico",
              title: "🔧 Soporte técnico",
              description: "Obtén ayuda con problemas técnicos"
            },
            {
              id: "consulta_cuenta",
              title: "👤 Consulta de cuenta",
              description: "Revisa el estado de tu cuenta"
            }
          ]
        },
        {
          title: "🛠️ Opciones adicionales",
          rows: [
            {
              id: "horarios_atencion",
              title: "🕐 Horarios de atención",
              description: "Consulta nuestros horarios de servicio"
            },
            {
              id: "contactar_humano",
              title: "👨‍💼 Hablar con agente",
              description: "Conectar con un representante humano"
            }
          ]
        }
      ]
    };

    return await this.sendListMessage(demoOptions);
  }
}

module.exports = WhatsAppClient;
