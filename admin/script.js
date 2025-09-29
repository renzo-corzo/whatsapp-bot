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
        section.rows.map(row => `
            <div class="list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                <span>${row.title}</span>
                <button class="btn btn-sm btn-info" onclick="editListResponse('${row.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-comment"></i> Respuesta
                </button>
            </div>
        `).join('')
    ).join('');

    div.innerHTML = `
        <div class="list-header">
            <div class="list-title">${listConfig.title}</div>
            <div class="response-actions">
                <button class="btn btn-sm btn-info" onclick="editList('${listId}')">
                    <i class="fas fa-edit"></i> Lista
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

// Funciones para listas
function openListModal(listId = null) {
    const modal = document.getElementById('listModal') || createListModal();
    const title = modal.querySelector('#listModalTitle');
    
    if (listId) {
        title.textContent = 'Editar Lista Interactiva';
        const listConfig = botConfig.lists[listId];
        document.getElementById('listId').value = listId;
        document.getElementById('listTitle').value = listConfig.title;
        document.getElementById('listDescription').value = listConfig.description;
        document.getElementById('listButtonText').value = listConfig.buttonText || 'Ver opciones';
        
        // Cargar secciones
        loadSectionsInModal(listConfig.sections);
    } else {
        title.textContent = 'Nueva Lista Interactiva';
        document.getElementById('listId').value = '';
        document.getElementById('listTitle').value = '';
        document.getElementById('listDescription').value = '';
        document.getElementById('listButtonText').value = 'Ver opciones';
        
        // Crear una sección por defecto
        loadSectionsInModal([{ title: 'Sección 1', rows: [{ id: '', title: '', description: '' }] }]);
    }
    
    modal.classList.add('show');
}

function editList(listId) {
    openListModal(listId);
}

async function deleteList(listId) {
    if (!confirm(`¿Estás seguro de eliminar la lista "${listId}"?`)) return;

    delete botConfig.lists[listId];

    try {
        const response = await fetch('/api/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botConfig.lists)
        });

        if (response.ok) {
            showToast('Lista eliminada correctamente', 'success');
            loadLists();
        } else {
            throw new Error('Error eliminando lista');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error eliminando lista', 'error');
    }
}

// Crear modal para listas interactivas
function createListModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'listModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3 id="listModalTitle">Editar Lista Interactiva</h3>
                <button class="modal-close" onclick="closeListModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>ID de la Lista:</label>
                    <input type="text" id="listId" placeholder="ej: menu_principal, soporte_opciones">
                </div>
                <div class="form-group">
                    <label>Título:</label>
                    <input type="text" id="listTitle" placeholder="ej: 📋 Menú Principal">
                </div>
                <div class="form-group">
                    <label>Descripción:</label>
                    <textarea id="listDescription" placeholder="Descripción que aparece en el mensaje"></textarea>
                </div>
                <div class="form-group">
                    <label>Texto del Botón:</label>
                    <input type="text" id="listButtonText" placeholder="Ver opciones">
                </div>
                
                <h4>📋 Secciones de la Lista</h4>
                <div id="sectionsContainer"></div>
                <button type="button" class="btn btn-info" onclick="addSection()">
                    <i class="fas fa-plus"></i> Agregar Sección
                </button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeListModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="saveList()">Guardar Lista</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeListModal() {
    const modal = document.getElementById('listModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Cargar secciones en el modal
function loadSectionsInModal(sections) {
    const container = document.getElementById('sectionsContainer');
    container.innerHTML = '';
    
    sections.forEach((section, sectionIndex) => {
        addSectionToModal(section, sectionIndex);
    });
}

// Agregar nueva sección
function addSection() {
    const container = document.getElementById('sectionsContainer');
    const sectionIndex = container.children.length;
    const newSection = { title: `Sección ${sectionIndex + 1}`, rows: [{ id: '', title: '', description: '' }] };
    addSectionToModal(newSection, sectionIndex);
}

// Agregar sección al modal
function addSectionToModal(section, sectionIndex) {
    const container = document.getElementById('sectionsContainer');
    
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-editor';
    sectionDiv.style.cssText = `
        border: 2px solid #e9ecef;
        border-radius: 10px;
        padding: 20px;
        margin: 15px 0;
        background: #f8f9fa;
    `;
    
    sectionDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h5>📁 Sección ${sectionIndex + 1}</h5>
            <button type="button" class="btn btn-sm btn-warning" onclick="removeSection(this)">
                <i class="fas fa-trash"></i> Eliminar Sección
            </button>
        </div>
        <div class="form-group">
            <label>Título de la Sección:</label>
            <input type="text" class="section-title" value="${section.title}" placeholder="ej: Servicios, Contacto">
        </div>
        <div class="rows-container">
            ${section.rows.map((row, rowIndex) => createRowHTML(row, rowIndex)).join('')}
        </div>
        <button type="button" class="btn btn-sm btn-info" onclick="addRow(this)">
            <i class="fas fa-plus"></i> Agregar Opción
        </button>
    `;
    
    container.appendChild(sectionDiv);
}

// Crear HTML para una fila/opción
function createRowHTML(row, rowIndex) {
    return `
        <div class="row-editor" style="border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Opción ${rowIndex + 1}</strong>
                <button type="button" class="btn btn-sm btn-warning" onclick="removeRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label>ID:</label>
                    <input type="text" class="row-id" value="${row.id}" placeholder="ej: info_general">
                </div>
                <div>
                    <label>Título:</label>
                    <input type="text" class="row-title" value="${row.title}" placeholder="ej: 📍 Información General">
                </div>
            </div>
            <div style="margin-top: 10px;">
                <label>Descripción:</label>
                <input type="text" class="row-description" value="${row.description}" placeholder="Descripción opcional">
            </div>
        </div>
    `;
}

// Agregar nueva fila/opción
function addRow(button) {
    const rowsContainer = button.previousElementSibling;
    const rowIndex = rowsContainer.children.length;
    const newRowHTML = createRowHTML({ id: '', title: '', description: '' }, rowIndex);
    
    const div = document.createElement('div');
    div.innerHTML = newRowHTML;
    rowsContainer.appendChild(div.firstElementChild);
}

// Remover sección
function removeSection(button) {
    const sectionDiv = button.closest('.section-editor');
    sectionDiv.remove();
}

// Remover fila
function removeRow(button) {
    const rowDiv = button.closest('.row-editor');
    rowDiv.remove();
}

// Guardar lista
async function saveList() {
    const listId = document.getElementById('listId').value.trim();
    const title = document.getElementById('listTitle').value.trim();
    const description = document.getElementById('listDescription').value.trim();
    const buttonText = document.getElementById('listButtonText').value.trim();

    if (!listId || !title || !description) {
        showToast('Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    // Recopilar secciones
    const sections = [];
    const sectionElements = document.querySelectorAll('.section-editor');
    
    sectionElements.forEach(sectionEl => {
        const sectionTitle = sectionEl.querySelector('.section-title').value.trim();
        if (!sectionTitle) return;

        const rows = [];
        const rowElements = sectionEl.querySelectorAll('.row-editor');
        
        rowElements.forEach(rowEl => {
            const id = rowEl.querySelector('.row-id').value.trim();
            const rowTitle = rowEl.querySelector('.row-title').value.trim();
            const rowDescription = rowEl.querySelector('.row-description').value.trim();
            
            if (id && rowTitle) {
                rows.push({ id, title: rowTitle, description: rowDescription });
            }
        });

        if (rows.length > 0) {
            sections.push({ title: sectionTitle, rows });
        }
    });

    if (sections.length === 0) {
        showToast('Debes agregar al menos una sección con opciones', 'error');
        return;
    }

    // Crear configuración de lista
    const listConfig = {
        title,
        description,
        buttonText,
        sections
    };

    botConfig.lists[listId] = listConfig;

    try {
        const response = await fetch('/api/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botConfig.lists)
        });

        if (response.ok) {
            showToast('Lista guardada correctamente', 'success');
            closeListModal();
            loadLists();
        } else {
            throw new Error('Error guardando lista');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error guardando lista', 'error');
    }
}

// Editar respuesta de opción de lista
async function editListResponse(optionId) {
    // Cargar configuración actual
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            botConfig = await response.json();
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }

    const currentResponse = botConfig.listResponses?.[optionId] || '';
    
    const newResponse = prompt(
        `Editar respuesta para la opción "${optionId}"\n\n` +
        `Cuando un usuario seleccione esta opción, el bot responderá:\n\n` +
        `Respuesta actual:\n${currentResponse}\n\n` +
        `Nueva respuesta:`,
        currentResponse
    );

    if (newResponse !== null && newResponse.trim() !== '') {
        // Asegurar que existe el objeto listResponses
        if (!botConfig.listResponses) {
            botConfig.listResponses = {};
        }
        
        botConfig.listResponses[optionId] = newResponse.trim();

        try {
            const saveResponse = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(botConfig)
            });

            if (saveResponse.ok) {
                showToast(`Respuesta para "${optionId}" guardada correctamente`, 'success');
            } else {
                throw new Error('Error guardando respuesta');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error guardando respuesta', 'error');
        }
    }
}

// Actualización automática del estado cada 30 segundos
setInterval(loadBotStatus, 30000);
