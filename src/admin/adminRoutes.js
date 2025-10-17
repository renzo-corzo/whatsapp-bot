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
    }
  },
  listResponses: {
    // 🚨 URGENCIAS
    'urgencias': {
      type: 'text',
      message: '🆘 URGENCIAS\n\n📞 0800-888-3226 (ECCO)\n📞 351 4466666\n\n📌 Al momento del llamado, tenga a mano el número de DNI del paciente.\n\n🏠 Médico a domicilio:\nPrestación destinada a consultas médicas generales realizadas en el domicilio del afiliado.\n\n⚠️ Sujeta a disponibilidad. Puede requerir copago y tiene tope mensual y anual.\n\n🔁 Para volver al menú principal, toque "↩️ Volver al Menú" o escriba "Menú".'
    },
    
    // 📄 AUTORIZACIONES - Botones
    'autorizaciones': {
      type: 'text_with_buttons',
      message: '📄 AUTORIZACIONES\nSelecciona una opción:',
      buttons: [
        { id: 'amb_solicitar', title: '📝 Solicitar Autoriz.' },
        { id: 'amb_seguimiento', title: '📦 Seguimiento' },
        { id: 'amb_reclamo', title: '⚠️ Reclamo' },
        { id: 'amb_revision', title: '🔎 Revisión' },
        { id: 'amb_volver', title: '↩️ Volver al Menú' }
      ]
    },
    
    // 📋 OTRAS GESTIONES
    'otras_gestiones': {
      type: 'text',
      message: 'Seleccioná el trámite:\n1. 👤 Afiliación\n2. 💸 Reintegros\n3. 💊 Medicamentos\n4. ❤️ Programas\n5. 🏥 Prestadores\n6. 🤝 Reciprocidad\n7. 🧑‍⚕️ Soporte prestador\n8. ❓ Otras consultas\n(Próximamente se implementan como listas o botones)\n\n↩️ Volver al Menú'
    },
    
    'info_general': {
      type: 'text',
          message: '✅ Información General.\n\n🏢 Somos la Caja de Previsión y Seguridad Social de Abogados y Procuradores de Córdoba. Estamos aquí para ayudarte con todas tus consultas.'
        },
        'soporte_tecnico': {
          type: 'text',
          message: '🔧 Soporte Técnico.\n\nNuestro equipo está disponible para ayudarte. Puedes contactarnos por los medios habituales.'
        },
        'consulta_cuenta': {
          type: 'text',
          message: '👤 Consulta de Cuenta.\n\nPara consultas sobre tu cuenta, puedes contactarnos por teléfono o email. Nuestro equipo te ayudará con cualquier información que necesites.'
        },
        'horarios_atencion': {
          type: 'text',
          message: '✅ Horarios de Atención.\n\n🕐 Nuestros horarios de atención son:\n• Lunes a Viernes: 8:00 AM - 6:00 PM\n• Sábados: 9:00 AM - 2:00 PM\n• Domingos: Cerrado\n\n⏰ Zona horaria: UTC-5'
        },
        'info_contacto': {
          type: 'text',
          message: '📍 *Caja de Previsión y Seguridad Social de Abogados y Procuradores de Córdoba*\n\n🏢 *Dirección:*\n27 de Abril 842, Córdoba, Argentina\n\n📞 *Teléfonos:*\n• Información General: 351 4235900 - int 185\n• Mesa de entrada: 351 4235900 – int 109\n• Contralor de Aportes: 351 5734543\n• Servicio médico (WhatsApp): 351 5284546\n\n📧 *Email:*\ninformacion@caja-abogados.com.ar\n\n🌐 *Web:*\nwww.caja-abogados.org.ar'
        },
        'afiliacion_caja': {
          type: 'text',
          message: '📝 Afiliación a la Caja Previsional.\n\nPara más información sobre el proceso de afiliación, contacta con nuestras oficinas.'
        },
        
        // 🚨 URGENCIAS Y EMERGENCIAS
        'urgencias_emergencias': {
          type: 'text',
          message: '🆘 *URGENCIAS Y EMERGENCIAS - 24HS*\n\n📞 *Línea de Emergencias:*\n• 351 5284546 (WhatsApp)\n• 0800-555-URGENCIA\n\n🏥 *Centros de Atención Inmediata:*\n• Hospital Privado Córdoba\n• Sanatorio Allende\n• Clínica Universitaria Reina Fabiola\n\n⚠️ *En caso de emergencia vital:*\nLlama al 107 (SAME) o dirígete al centro médico más cercano.\n\n💡 *Recuerda tener a mano:*\n• Credencial de afiliado\n• DNI\n• Orden médica (si la tienes)',
          followUp: 'soporte_submenu'
        },
        
        // 🚨 EMERGENCIAS (opción del menú principal)
        'emergencias': {
          type: 'text',
          message: '🆘 *EMERGENCIAS - ATENCIÓN 24HS*\n\nPara emergencias médicas urgentes:',
          followUp: 'soporte_submenu'
        },
        
        // 💊 SERVICIOS MÉDICOS
        'autorizaciones': {
          type: 'text',
          message: '📋 *AUTORIZACIONES MÉDICAS*\n\n📝 *Para solicitar autorizaciones necesitas:*\n• Orden médica del profesional tratante\n• Credencial de afiliado vigente\n• DNI del paciente\n\n📞 *Canales de solicitud:*\n• WhatsApp: 351 5284546\n• Teléfono: 351 4235900 - int 200\n• Presencial: 27 de Abril 842\n\n⏰ *Tiempo de respuesta:*\n• Urgentes: 24-48hs\n• Programadas: 3-5 días hábiles\n\n💡 *Tip:* Envía la documentación por WhatsApp para agilizar el trámite.'
        },
        
        'medicamentos': {
          type: 'text',
          message: '💊 *MEDICAMENTOS Y COBERTURA*\n\n📋 *Cobertura incluye:*\n• Medicamentos del Vademécum\n• Tratamientos crónicos\n• Medicación oncológica\n• Insulinas y diabéticos\n\n🏪 *Farmacias adheridas:*\n• Farmacity\n• Dr. Ahorro\n• Farmacias del Centro\n\n📱 *Para consultar cobertura:*\n• WhatsApp: 351 5284546\n• Web: www.caja-abogados.org.ar/vademecum\n\n💰 *Descuentos:*\n• Afiliados: 40-60%\n• Grupo familiar: 40%\n• Jubilados: 70%'
        },
        
        'reintegros': {
          type: 'text',
          message: '💰 *REINTEGROS MÉDICOS*\n\n📄 *Documentación requerida:*\n• Factura original del prestador\n• Recibo de pago\n• Orden médica\n• Credencial de afiliado\n\n📍 *Presentación:*\n• Presencial: 27 de Abril 842\n• Email: reintegros@caja-abogados.com.ar\n• WhatsApp: 351 5284546\n\n⏰ *Plazos:*\n• Presentación: hasta 60 días\n• Procesamiento: 15-20 días hábiles\n• Pago: 5 días hábiles\n\n💡 *Montos máximos según categoría de afiliación disponibles en nuestra web.'
        },
        
        // 🏥 PROGRAMAS Y CONVENIOS
        'programas': {
          type: 'text',
          message: '🩺 *PROGRAMAS DE SALUD*\n\n🔬 *Programas Preventivos:*\n• Chequeos anuales gratuitos\n• Mamografías y PAP\n• Control cardiológico\n• Vacunación antigripal\n\n👶 *Programas Especiales:*\n• Maternidad y pediatría\n• Tercera edad\n• Enfermedades crónicas\n• Salud mental\n\n📅 *Para inscribirte:*\n• WhatsApp: 351 5284546\n• Teléfono: 351 4235900 - int 250\n• Web: www.caja-abogados.org.ar/programas\n\n🎁 *Beneficios adicionales para participantes activos.'
        },
        
        'convenios_reciprocidad': {
          type: 'text',
          message: '🤝 *CONVENIOS DE RECIPROCIDAD*\n\n🗺️ *Cobertura en:*\n• Buenos Aires - CABA\n• Santa Fe - Rosario\n• Mendoza - Capital\n• Tucumán - San Miguel\n\n📋 *Para usar el convenio:*\n• Credencial vigente\n• Autorización previa (no urgencias)\n• DNI del afiliado\n\n📞 *Gestión de autorizaciones:*\n• WhatsApp: 351 5284546\n• Email: reciprocidad@caja-abogados.com.ar\n\n⚠️ *Importante:* Consulta prestadores adheridos en cada provincia antes de viajar.'
        },
        
        // ℹ️ INFORMACIÓN Y SOPORTE
        'preguntas_frecuentes': {
          type: 'text',
          message: '❓ *PREGUNTAS FRECUENTES*\n\n🔸 *¿Cómo obtengo mi credencial?*\nSe envía por correo al domicilio registrado.\n\n🔸 *¿Puedo atenderme sin credencial?*\nSí, con DNI y número de afiliado.\n\n🔸 *¿Cómo cambio de médico de cabecera?*\nSolicítalo por WhatsApp o presencialmente.\n\n🔸 *¿Qué hago si pierdo la credencial?*\nSolicita duplicado por WhatsApp.\n\n🔸 *¿Hay copagos?*\nConsultas y estudios básicos sin costo.\n\n📱 *Más consultas:* WhatsApp 351 5284546'
        },
        
        'asistencia_prestadores': {
          type: 'text',
          message: '👨‍⚕️ *ASISTENCIA A PRESTADORES*\n\n🏥 *Servicios para profesionales:*\n• Liquidación de prácticas\n• Consultas de nomenclador\n• Gestión de autorizaciones\n• Capacitaciones\n\n📞 *Mesa de ayuda:*\n• Teléfono: 351 4235900 - int 300\n• Email: prestadores@caja-abogados.com.ar\n• WhatsApp: 351 5284546\n\n💻 *Portal web:*\nwww.caja-abogados.org.ar/prestadores\n\n📋 *Documentación y formularios disponibles online las 24hs.'
        },
        
        'afiliacion': {
          type: 'text',
          message: '📝 *AFILIACIÓN AL SERVICIO MÉDICO*\n\n👥 *Quiénes pueden afiliarse:*\n• Abogados matriculados\n• Procuradores habilitados\n• Grupo familiar directo\n\n📄 *Documentación requerida:*\n• Solicitud de afiliación\n• Fotocopia de matrícula\n• DNI y CUIL\n• Constancia domicilio\n\n💰 *Aportes mensuales:*\n• Activos: según categoría\n• Jubilados: bonificado\n• Grupo familiar: adicional\n\n📍 *Inscripción:*\n27 de Abril 842 - Lunes a Viernes 8 a 16hs\n\n📞 *Consultas:* 351 4235900 - int 185'
        },
        'calendario_pagos': {
      type: 'text',
          message: '📅 Calendario de Pagos.\n\nConsulta las fechas de vencimiento en nuestra página web o contacta con nosotros.'
    },
        'emision_boletas': {
      type: 'text',
          message: '🧾 Emisión de Boletas.\n\nPuedes generar tus boletas a través de nuestro sistema de autogestión online.'
    },
        'afiliacion_medica': {
      type: 'text',
          message: '🩺 Afiliación al Servicio Médico.\n\nPara información sobre afiliación médica, consulta en nuestras oficinas.'
    },
        'ordenes_medicas': {
      type: 'text',
          message: '📋 Órdenes Médicas.\n\nPuedes gestionar tus órdenes médicas desde nuestro sistema de autogestión.'
    },
        'consulta_prestadores': {
      type: 'text',
          message: '🏥 Consulta de Prestadores.\n\nInformación sobre médicos y prestadores disponible en nuestra web.'
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
          title: 'Tipos de Soporte',
          description: 'Que tipo de ayuda necesitas?',
          sections: [
            {
              title: 'Soporte Tecnico',
              rows: [
                { id: 'problema_conexion', title: 'Problemas de Conexion', description: 'Internet, WiFi, red' },
                { id: 'problema_software', title: 'Problemas de Software', description: 'Aplicaciones, programas' },
                { id: 'problema_hardware', title: 'Problemas de Hardware', description: 'Equipos, dispositivos' }
              ]
            },
            {
              title: 'Soporte Comercial',
              rows: [
                { id: 'cambio_plan', title: 'Cambiar Plan', description: 'Upgrade o downgrade' },
                { id: 'facturacion', title: 'Consultas de Facturacion', description: 'Facturas, pagos' }
              ]
            },
            {
              title: 'Navegacion',
              rows: [
                { id: 'volver_menu_principal', title: 'Volver al Menu Principal', description: 'Regresar al inicio' }
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
          type: 'text',
          message: '🔙 Regresando al menú principal...',
          followUp: 'demo_list'
        },
        
        // 📝 SOLICITAR AUTORIZACIONES
        'amb_solicitar': {
          type: 'text',
          message: 'Los prestadores ya gestionan las autorizaciones desde el sistema web de la Caja.\nAl cargar el pedido, se genera un Nº de trámite (ej: 19----). Con ese número podrá consultar el estado en el portal.\nSi el pedido es de Sanatorio Allende u otro prestador que no opere por sistema, envíenos una foto clara del pedido por este medio.'
        },
        
        // 📦 SEGUIMIENTO
        'amb_seguimiento': {
          type: 'text',
          message: 'Consulte el estado de su autorización en el portal de la Caja ingresando el Nº de trámite:\nhttps://autogestion.caja-abogados.org.ar'
        },
        
        // ⚠️ RECLAMO
        'amb_reclamo': {
          type: 'text',
          message: 'El tiempo estimado de resolución de una autorización ambulatoria es de hasta 48 horas hábiles.\nSi el trámite excede ese plazo, por favor envíenos:\n• Nº de trámite (ej: 19----)\n• Nombre del afiliado/paciente\n• Observaciones (si las hubiera)\nImportante: Las prácticas de urgencia y/o internación poseen plazos diferenciados.'
        },
        
        // 🔎 REVISIÓN
        'amb_revision': {
          type: 'text',
          message: 'Puede solicitar revisión del trámite en los siguientes casos:\n• Pedido médico devuelto en el portal (requiere documentación adicional)\n• Prácticas fuera de convenio (adjuntar informe, estudios previos y presupuesto)\n• Procedimientos especiales o de alto costo (justificar con documentación)\n• Errores en la solicitud (adjuntar corrección solicitada por auditoría)'
        },
        
        // ↩️ VOLVER AL MENÚ
        'amb_volver': {
          type: 'text',
          message: '🔙 Regresando al menú principal...',
          followUp: 'demo_list'
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
      res.json(config.listResponses || {});
    } catch (error) {
      console.error('Error cargando respuestas de lista:', error);
      res.status(500).json({ error: 'Error cargando respuestas de lista' });
    }
  });

  // API: Guardar respuestas
  router.post('/api/responses', async (req, res) => {
    try {
      const config = await loadConfig();
      config.listResponses = req.body;
      await saveConfig(config);
      console.log('✅ ListResponses guardadas:', JSON.stringify(req.body, null, 2));
      res.json({ success: true, message: 'Respuestas de lista guardadas correctamente' });
    } catch (error) {
      console.error('Error guardando respuestas de lista:', error);
      res.status(500).json({ error: 'Error guardando respuestas de lista' });
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

  // API para obtener opciones vinculadas
  router.get('/api/linked-options', async (req, res) => {
    try {
      const config = await loadConfig();
      const linkedOptions = [];
      
      // Buscar solo en las listas interactivas (menús principales)
      Object.keys(config.lists || {}).forEach(listId => {
        const list = config.lists[listId];
        if (list.sections) {
          list.sections.forEach(section => {
            if (section.rows) {
              section.rows.forEach(row => {
                // Verificar si la respuesta de esta opción tiene followUp
                const response = config.listResponses && config.listResponses[row.id];
                if (response && response.followUp) {
                  linkedOptions.push({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    listId: listId,
                    listTitle: list.title,
                    sectionTitle: section.title,
                    submenuId: response.followUp
                  });
                }
              });
            }
          });
        }
      });

      res.json({ 
        success: true, 
        linkedOptions: linkedOptions 
      });
    } catch (error) {
      console.error('Error obteniendo opciones vinculadas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo opciones vinculadas' 
      });
    }
  });

  // API para verificar si una opción tiene vinculación
  router.get('/api/check-link/:optionId', async (req, res) => {
    try {
      const { optionId } = req.params;
      const config = await loadConfig();
      
      // Buscar en las respuestas de lista
      const response = config.listResponses && config.listResponses[optionId];
      const hasLink = response && response.followUp;
      
      res.json({ 
        success: true, 
        hasLink: hasLink,
        submenuId: hasLink ? response.followUp : null
      });
    } catch (error) {
      console.error('Error verificando vinculación:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error verificando vinculación' 
      });
    }
  });

  // API simple para desvincular submenú
  router.post('/api/unlink-submenu', async (req, res) => {
    try {
      const { optionId } = req.body;
      
      if (!optionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de opcion requerido' 
        });
      }

      const config = await loadConfig();
      let unlinked = false;
      
      // Buscar en las respuestas principales
      if (config.responses && config.responses[optionId] && config.responses[optionId].followUp) {
        delete config.responses[optionId].followUp;
        unlinked = true;
        console.log(`Desvinculado submenu de respuesta principal: ${optionId}`);
      }
      
      // Buscar en las respuestas de lista
      if (config.listResponses && config.listResponses[optionId] && config.listResponses[optionId].followUp) {
        delete config.listResponses[optionId].followUp;
        unlinked = true;
        console.log(`Desvinculado submenu de lista: ${optionId}`);
      }

      if (unlinked) {
        await saveConfig(config);
        res.json({ 
          success: true, 
          message: 'Submenu desvinculado correctamente' 
        });
      } else {
        res.json({ 
          success: false, 
          message: 'No se encontro vinculacion para esta opcion' 
        });
      }
    } catch (error) {
      console.error('Error desvinculando submenu:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error desvinculando submenu' 
      });
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
