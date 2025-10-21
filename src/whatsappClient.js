const { sendWhatsApp } = require('./whatsapp/client');

class WhatsAppClient {
  constructor(token = null, phoneId = null) {
    this.accessToken = token || process.env.META_TOKEN || process.env.META_WABA_TOKEN;
    this.phoneNumberId = phoneId || process.env.PHONE_NUMBER_ID;
    
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('Faltan variables de entorno: META_TOKEN y PHONE_NUMBER_ID son requeridas');
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
      // Usar cliente centralizado con logs limpios
      const result = await sendWhatsApp(payload);
      
      if (result.ok) {
        console.log(`✅ Mensaje de texto enviado a ${to}`);
        return result.data;
      } else {
        console.error(`❌ Error enviando mensaje de texto: ${result.error.message}`);
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('❌ Error en sendText:', error.message);
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
    console.log(`🔧 sendListMessage recibió:`, {
      to: to,
      header: header,
      body: body?.substring(0, 50) + '...',
      sectionsCount: sections?.length || 0,
      sectionsType: Array.isArray(sections) ? 'ARRAY' : typeof sections
    });
    
    // Validar que las secciones tengan el formato correcto
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      console.log(`❌ Validación falló:`, { sections, isArray: Array.isArray(sections), length: sections?.length });
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
      // Usar cliente centralizado con logs limpios
      const result = await sendWhatsApp(payload);
      
      if (result.ok) {
        console.log(`✅ Mensaje de lista enviado a ${to}`);
        return result.data;
      } else {
        console.error(`❌ Error enviando lista: ${result.error.message}`);
        throw new Error(result.error.message);
      }
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

  /**
   * Envía un mensaje de lista desde configuración simplificada
   * @param {string} to - Número de teléfono del destinatario
   * @param {Object} listConfig - Configuración de la lista
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendListFromConfig(to, listConfig) {
    const options = {
      to: to,
      header: listConfig.header || undefined,
      body: listConfig.description || listConfig.body || "Selecciona una opción:",
      footer: listConfig.footer || undefined,
      buttonText: listConfig.buttonText || "Ver opciones",
      sections: listConfig.sections
    };

    return await this.sendListMessage(options);
  }

  /**
   * Envía un mensaje con botones interactivos
   * @param {string} to - Número de teléfono del destinatario
   * @param {string} body - Texto principal del mensaje
   * @param {Array} buttons - Array de botones [{id, title}]
   * @param {string} header - Texto del encabezado (opcional)
   * @param {string} footer - Texto del pie de página (opcional)
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendButtonMessage(to, body, buttons, header = null, footer = null) {
    // Validar botones
    if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
      throw new Error('Se requiere al menos un botón');
    }

    if (buttons.length > 3) {
      throw new Error('WhatsApp permite máximo 3 botones');
    }

    // Validar estructura de botones
    buttons.forEach((button, index) => {
      if (!button.id || !button.title) {
        throw new Error(`El botón ${index} debe tener id y title`);
      }
      if (button.title.length > 20) {
        throw new Error(`El título del botón ${index} debe tener máximo 20 caracteres`);
      }
    });

    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
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
          buttons: buttons.map((button, index) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title
            }
          }))
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
      // Usar cliente centralizado con logs limpios
      const result = await sendWhatsApp(payload);
      
      if (result.ok) {
        console.log(`✅ Mensaje de botones enviado a ${to}`);
        return result.data;
      } else {
        console.error(`❌ Error enviando botones: ${result.error.message}`);
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje con botones:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Envía un mensaje con URL (texto + link)
   * @param {string} to - Número de teléfono del destinatario
   * @param {string} message - Mensaje de texto
   * @param {string} url - URL a incluir
   * @param {string} urlText - Texto descriptivo del link (opcional)
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendTextWithUrl(to, message, url, urlText = null) {
    // WhatsApp no tiene un tipo específico para URLs, pero podemos incluirlas en el texto
    const fullMessage = urlText 
      ? `${message}\n\n${urlText}\n${url}`
      : `${message}\n\n${url}`;

    return await this.sendText(to, fullMessage);
  }

  /**
   * Envía una lista interactiva desde configuración de submenú
   * @param {string} to - Número de teléfono del destinatario
   * @param {Object} submenuConfig - Configuración del submenú
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendListFromConfig(to, submenuConfig) {
    console.log(`🔧 sendListFromConfig llamada con:`, submenuConfig ? 'CONFIG VÁLIDA' : 'CONFIG NULA');
    
    if (!submenuConfig) {
      throw new Error('Configuración de submenú es nula');
    }
    
    if (!submenuConfig.sections) {
      console.log(`❌ submenuConfig.sections es:`, submenuConfig.sections);
      throw new Error('Configuración de submenú no tiene secciones');
    }
    
    if (!Array.isArray(submenuConfig.sections) || submenuConfig.sections.length === 0) {
      console.log(`❌ Secciones inválidas:`, submenuConfig.sections);
      throw new Error('Las secciones deben ser un array no vacío');
    }

    const { title, description, sections } = submenuConfig;
    console.log(`📤 Enviando lista: ${title} con ${sections.length} secciones`);
    
    return await this.sendListMessage({
      to: to,
      header: title || null,
      body: description || title || "Selecciona una opción:",
      footer: null,
      buttonText: "Ver opciones",
      sections: sections
    });
  }
}

module.exports = WhatsAppClient;
