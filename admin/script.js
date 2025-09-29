// Variables globales
let botConfig = {
    responses: {},
    lists: {},
    stats: {
        totalMessages: 0,
        uniqueUsers: 0,
        responseTime: '0ms'
    }
};

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadBotStatus();
    loadConfiguration();
});

// Inicializar la aplicación
function initializeApp() {
    console.log('🚀 Inicializando Portal de Administración');
    showToast('Bienvenido al Portal de Administración', 'success');
}

// Configurar event listeners
function setupEventListeners() {
    // Navegación entre tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Botones principales
    document.getElementById('addResponseBtn')?.addEventListener('click', openResponseModal);
    document.getElementById('addListBtn')?.addEventListener('click', openListModal);
    document.getElementById('saveConfigBtn')?.addEventListener('click', saveConfiguration);
    document.getElementById('exportConfigBtn')?.addEventListener('click', exportConfiguration);
    document.getElementById('importConfigBtn')?.addEventListener('click', () => {
        document.getElementById('configFileInput').click();
    });

    // Modal de respuestas
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    document.getElementById('saveResponse')?.addEventListener('click', saveResponse);

    // Import de configuración
    document.getElementById('configFileInput')?.addEventListener('change', importConfiguration);

    // Cerrar modal al hacer clic fuera
    document.getElementById('responseModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// Cambiar entre tabs
function switchTab(tabName) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Cargar datos específicos del tab
    switch(tabName) {
        case 'responses':
            loadResponses();
            break;
        case 'lists':
            loadLists();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Verificar estado del bot
async function loadBotStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        const statusDot = document.getElementById('botStatus');
        const statusText = document.getElementById('statusText');
        
        if (data.status === 'online') {
            statusDot.classList.remove('offline');
            statusText.textContent = 'Bot Online - Funcionando correctamente';
        } else {
            statusDot.classList.add('offline');
            statusText.textContent = 'Bot Offline - Verificar configuración';
        }
    } catch (error) {
        console.error('Error verificando estado del bot:', error);
        document.getElementById('statusText').textContent = 'Error de conexión';
        document.getElementById('botStatus').classList.add('offline');
    }
}

// Cargar configuración general
async function loadConfiguration() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            botConfig = await response.json();
            console.log('✅ Configuración cargada:', botConfig);
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
        // Cargar configuración por defecto
        loadDefaultConfiguration();
    }
}

// Configuración por defecto
function loadDefaultConfiguration() {
    botConfig = {
        responses: {
            'hola': {
                type: 'text',
                message: '¡Hola! 👋 Bienvenido al bot de WhatsApp. Te voy a enviar un menú de opciones.',
                followUp: 'demo_list'
            },
            'menu': {
                type: 'list',
                message: 'demo_list'
            },
            'soporte': {
                type: 'text',
                message: '🔧 Nuestro equipo de soporte está disponible para ayudarte. Por favor, describe tu problema.'
            }
        },
        lists: {
            'demo_list': {
                title: '📋 Menú Principal',
                description: 'Selecciona una opción:',
                sections: [
                    {
                        title: 'Servicios',
                        rows: [
                            { id: 'info_general', title: '📍 Información General', description: 'Conoce más sobre nosotros' },
                            { id: 'soporte_tecnico', title: '🔧 Soporte Técnico', description: 'Ayuda técnica especializada' },
                            { id: 'consulta_cuenta', title: '👤 Consulta de Cuenta', description: 'Información de tu cuenta' }
                        ]
                    },
                    {
                        title: 'Contacto',
                        rows: [
                            { id: 'horarios_atencion', title: '🕐 Horarios de Atención', description: 'Ver horarios disponibles' },
                            { id: 'contactar_humano', title: '👨‍💼 Hablar con Agente', description: 'Conectar con persona real' }
                        ]
                    }
                ]
            }
        },
        stats: {
            totalMessages: 0,
            uniqueUsers: 0,
            responseTime: '~150ms'
        }
    };
}

// Cargar respuestas
function loadResponses() {
    const container = document.getElementById('responseTree');
    container.innerHTML = '';

    Object.entries(botConfig.responses).forEach(([command, config]) => {
        const responseItem = createResponseItem(command, config);
        container.appendChild(responseItem);
    });
}

// Crear elemento de respuesta
function createResponseItem(command, config) {
    const div = document.createElement('div');
    div.className = 'response-item';
    div.innerHTML = `
        <div class="response-header">
            <div class="response-command">${command}</div>
            <div class="response-actions">
                <button class="btn btn-sm btn-info" onclick="editResponse('${command}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-warning" onclick="deleteResponse('${command}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
        <div class="response-preview">
            <strong>Tipo:</strong> ${config.type}<br>
            <strong>Mensaje:</strong> ${config.message.length > 100 ? config.message.substring(0, 100) + '...' : config.message}
        </div>
    `;
    return div;
}

// Cargar listas interactivas
function loadLists() {
    const container = document.getElementById('listsContainer');
    container.innerHTML = '';

    Object.entries(botConfig.lists).forEach(([listId, listConfig]) => {
        const listCard = createListCard(listId, listConfig);
        container.appendChild(listCard);
    });
}

// Crear tarjeta de lista
function createListCard(listId, listConfig) {
    const div = document.createElement('div');
    div.className = 'list-card';
    
    const itemsHtml = listConfig.sections.map(section => 
        section.rows.map(row => `<div class="list-item">${row.title}</div>`).join('')
    ).join('');

    div.innerHTML = `
        <div class="list-header">
            <div class="list-title">${listConfig.title}</div>
            <div class="response-actions">
                <button class="btn btn-sm btn-info" onclick="editList('${listId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="deleteList('${listId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p><strong>Descripción:</strong> ${listConfig.description}</p>
        <div class="list-items">
            ${itemsHtml}
        </div>
    `;
    return div;
}

// Cargar estadísticas
async function loadAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        const stats = await response.json();
        
        document.getElementById('totalMessages').textContent = stats.totalMessages || '--';
        document.getElementById('uniqueUsers').textContent = stats.uniqueUsers || '--';
        document.getElementById('responseTime').textContent = stats.responseTime || '--';
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mostrar datos de ejemplo
        document.getElementById('totalMessages').textContent = botConfig.stats.totalMessages;
        document.getElementById('uniqueUsers').textContent = botConfig.stats.uniqueUsers;
        document.getElementById('responseTime').textContent = botConfig.stats.responseTime;
    }
}

// Cargar configuración
function loadSettings() {
    // Aquí podrías cargar configuraciones específicas
    console.log('Cargando configuraciones...');
}

// Modal de respuestas
function openResponseModal(command = null) {
    const modal = document.getElementById('responseModal');
    const title = document.getElementById('modalTitle');
    
    if (command) {
        title.textContent = 'Editar Respuesta';
        const config = botConfig.responses[command];
        document.getElementById('responseCommand').value = command;
        document.getElementById('responseText').value = config.message;
        document.getElementById('responseType').value = config.type;
    } else {
        title.textContent = 'Nueva Respuesta';
        document.getElementById('responseCommand').value = '';
        document.getElementById('responseText').value = '';
        document.getElementById('responseType').value = 'text';
    }
    
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('responseModal').classList.remove('show');
}

// Guardar respuesta
async function saveResponse() {
    const command = document.getElementById('responseCommand').value.trim();
    const message = document.getElementById('responseText').value.trim();
    const type = document.getElementById('responseType').value;

    if (!command || !message) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }

    botConfig.responses[command] = {
        type: type,
        message: message
    };

    try {
        const response = await fetch('/api/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botConfig.responses)
        });

        if (response.ok) {
            showToast('Respuesta guardada correctamente', 'success');
            closeModal();
            loadResponses();
        } else {
            throw new Error('Error guardando respuesta');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error guardando respuesta', 'error');
    }
}

// Editar respuesta
function editResponse(command) {
    openResponseModal(command);
}

// Eliminar respuesta
async function deleteResponse(command) {
    if (!confirm(`¿Estás seguro de eliminar la respuesta "${command}"?`)) return;

    delete botConfig.responses[command];

    try {
        const response = await fetch('/api/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botConfig.responses)
        });

        if (response.ok) {
            showToast('Respuesta eliminada', 'success');
            loadResponses();
        } else {
            throw new Error('Error eliminando respuesta');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error eliminando respuesta', 'error');
    }
}

// Guardar configuración general
async function saveConfiguration() {
    const metaToken = document.getElementById('metaToken').value;
    const phoneNumberId = document.getElementById('phoneNumberId').value;

    const config = {
        metaToken,
        phoneNumberId
    };

    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            showToast('Configuración guardada correctamente', 'success');
        } else {
            throw new Error('Error guardando configuración');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error guardando configuración', 'error');
    }
}

// Exportar configuración
function exportConfiguration() {
    const dataStr = JSON.stringify(botConfig, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `whatsapp-bot-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('Configuración exportada correctamente', 'success');
}

// Importar configuración
function importConfiguration(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            botConfig = config;
            
            // Actualizar interfaz
            loadResponses();
            loadLists();
            loadAnalytics();
            
            showToast('Configuración importada correctamente', 'success');
        } catch (error) {
            console.error('Error importando configuración:', error);
            showToast('Error al importar: archivo inválido', 'error');
        }
    };
    reader.readAsText(file);
}

// Sistema de notificaciones toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        ${message}
    `;

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Remover toast después de 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 4000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Funciones para listas (implementar según necesidades)
function openListModal() {
    showToast('Función en desarrollo', 'info');
}

function editList(listId) {
    showToast('Función en desarrollo', 'info');
}

function deleteList(listId) {
    showToast('Función en desarrollo', 'info');
}

// Actualización automática del estado cada 30 segundos
setInterval(loadBotStatus, 30000);
