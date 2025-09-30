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
    document.getElementById('addSubmenuBtn')?.addEventListener('click', () => openSubmenuModal());
    document.getElementById('saveConfigBtn')?.addEventListener('click', saveConfiguration);
    document.getElementById('testConfigBtn')?.addEventListener('click', testConfiguration);
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

    // Cargar listas principales
    if (botConfig.lists) {
        Object.entries(botConfig.lists).forEach(([listId, listConfig]) => {
            const listCard = createListCard(listId, listConfig);
            container.appendChild(listCard);
        });
    }

    // Cargar submenús
    if (botConfig.submenus) {
        Object.entries(botConfig.submenus).forEach(([submenuId, submenuConfig]) => {
            const submenuCard = createSubmenuCard(submenuId, submenuConfig);
            container.appendChild(submenuCard);
        });
    }
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

// Crear tarjeta para submenús
function createSubmenuCard(submenuId, submenuConfig) {
    const div = document.createElement('div');
    div.className = 'list-card';
    div.style.borderLeft = '4px solid #17a2b8';
    
    const itemsHtml = submenuConfig.sections.map(section => 
        section.rows.map(row => `
            <div class="list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                <span>${row.title}</span>
                <button class="btn btn-sm btn-info" onclick="editSubmenuResponse('${row.id}')" style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-comment"></i> Respuesta
                </button>
            </div>
        `).join('')
    ).join('');

    div.innerHTML = `
        <div class="list-header">
            <div class="list-title">🔗 ${submenuConfig.title} <small>(Submenú)</small></div>
            <div class="response-actions">
                <button class="btn btn-sm btn-info" onclick="editSubmenu('${submenuId}')">
                    <i class="fas fa-edit"></i> Submenú
                </button>
                <button class="btn btn-sm btn-warning" onclick="deleteSubmenu('${submenuId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p><strong>Descripción:</strong> ${submenuConfig.description}</p>
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
    const metaToken = document.getElementById('metaToken').value.trim();
    const phoneNumberId = document.getElementById('phoneNumberId').value.trim();

    if (!metaToken || !phoneNumberId) {
        showToast('Por favor completa el Token y Phone Number ID', 'warning');
        return;
    }

    const config = {
        metaToken,
        phoneNumberId
    };

    try {
        showToast('Actualizando configuración en tiempo real...', 'info');
        
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.reloaded) {
                showToast('🎉 Configuración actualizada en tiempo real! El bot ya usa las nuevas credenciales.', 'success');
                
                // Actualizar el estado del bot
                setTimeout(() => {
                    loadBotStatus();
                }, 2000);
            } else {
                showToast('Configuración guardada correctamente', 'success');
            }
        } else {
            throw new Error(result.error || 'Error guardando configuración');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error guardando configuración: ' + error.message, 'error');
    }
}

// Probar configuración actual
async function testConfiguration() {
    try {
        showToast('Probando token actual...', 'info');
        
        const response = await fetch('/send-demo?to=543515747073');
        const result = await response.json();

        if (response.ok && result.success) {
            showToast('✅ ¡Token funciona perfectamente! Mensaje enviado.', 'success');
        } else {
            throw new Error(result.error || result.details || 'Error en la prueba');
        }
    } catch (error) {
        console.error('Error en prueba:', error);
        showToast('❌ Token no funciona: ' + error.message, 'error');
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
    await editResponseForOption(optionId, 'listResponses');
}

// Editar respuesta de opción de submenú
async function editSubmenuResponse(optionId) {
    await editResponseForOption(optionId, 'submenuResponses');
}

// Función genérica para editar respuestas
async function editResponseForOption(optionId, responseType) {
    // Cargar configuración actual
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            botConfig = await response.json();
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }

    const currentResponse = botConfig[responseType]?.[optionId] || '';
    const displayResponse = typeof currentResponse === 'string' 
        ? currentResponse 
        : JSON.stringify(currentResponse, null, 2);
    
    const newResponse = prompt(
        `Editar respuesta para la opción "${optionId}"\n\n` +
        `Cuando un usuario seleccione esta opción, el bot responderá:\n\n` +
        `Respuesta actual:\n${displayResponse}\n\n` +
        `Nueva respuesta (texto simple):`,
        typeof currentResponse === 'string' ? currentResponse : currentResponse.message || ''
    );

    if (newResponse !== null && newResponse.trim() !== '') {
        // Asegurar que existe el objeto
        if (!botConfig[responseType]) {
            botConfig[responseType] = {};
        }
        
        // Guardar como texto simple por ahora
        botConfig[responseType][optionId] = {
            type: 'text',
            message: newResponse.trim()
        };

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

// Funciones para manejar submenús
function editSubmenu(submenuId) {
    openSubmenuModal(submenuId);
}

function deleteSubmenu(submenuId) {
    if (!confirm(`¿Estás seguro de eliminar el submenú "${submenuId}"?`)) return;
    
    if (botConfig.submenus && botConfig.submenus[submenuId]) {
        delete botConfig.submenus[submenuId];
        
        // También eliminar las respuestas asociadas
        if (botConfig.submenuResponses) {
            const submenu = botConfig.submenus[submenuId];
            if (submenu && submenu.sections) {
                submenu.sections.forEach(section => {
                    section.rows.forEach(row => {
                        delete botConfig.submenuResponses[row.id];
                    });
                });
            }
        }
        
        // Guardar cambios
        fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botConfig)
        }).then(response => {
            if (response.ok) {
                showToast('Submenú eliminado correctamente', 'success');
                loadLists();
            } else {
                showToast('Error eliminando submenú', 'error');
            }
        });
    }
}

// Modal para editar submenús
function openSubmenuModal(submenuId = null) {
    const modal = document.getElementById('submenuModal') || createSubmenuModal();
    const title = modal.querySelector('#submenuModalTitle');
    
    if (submenuId) {
        title.textContent = 'Editar Submenú';
        const submenuConfig = botConfig.submenus[submenuId];
        document.getElementById('submenuId').value = submenuId;
        document.getElementById('submenuTitle').value = submenuConfig.title;
        document.getElementById('submenuDescription').value = submenuConfig.description;
        
        // Cargar secciones del submenú
        loadSubmenuSectionsInModal(submenuConfig.sections);
    } else {
        title.textContent = 'Nuevo Submenú';
        document.getElementById('submenuId').value = '';
        document.getElementById('submenuTitle').value = '';
        document.getElementById('submenuDescription').value = '';
        
        // Crear una sección por defecto
        loadSubmenuSectionsInModal([{ title: 'Sección 1', rows: [{ id: '', title: '', description: '' }] }]);
    }
    
    modal.classList.add('show');
}

function closeSubmenuModal() {
    const modal = document.getElementById('submenuModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Crear modal para submenús
function createSubmenuModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'submenuModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h3 id="submenuModalTitle">Editar Submenú</h3>
                <button class="modal-close" onclick="closeSubmenuModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>ID del Submenú:</label>
                    <input type="text" id="submenuId" placeholder="ej: info_submenu, soporte_submenu">
                </div>
                <div class="form-group">
                    <label>Título:</label>
                    <input type="text" id="submenuTitle" placeholder="ej: 📍 Información Detallada">
                </div>
                <div class="form-group">
                    <label>Descripción:</label>
                    <textarea id="submenuDescription" placeholder="Descripción que aparece en el submenú"></textarea>
                </div>
                
                <h4>📋 Secciones del Submenú</h4>
                <div id="submenuSectionsContainer"></div>
                <button type="button" class="btn btn-info" onclick="addSubmenuSection()">
                    <i class="fas fa-plus"></i> Agregar Sección
                </button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeSubmenuModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="saveSubmenu()">Guardar Submenú</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Cargar secciones del submenú en el modal
function loadSubmenuSectionsInModal(sections) {
    const container = document.getElementById('submenuSectionsContainer');
    container.innerHTML = '';
    
    sections.forEach((section, sectionIndex) => {
        addSubmenuSectionToModal(section, sectionIndex);
    });
}

// Agregar nueva sección al submenú
function addSubmenuSection() {
    const container = document.getElementById('submenuSectionsContainer');
    const sectionIndex = container.children.length;
    const newSection = { title: `Sección ${sectionIndex + 1}`, rows: [{ id: '', title: '', description: '' }] };
    addSubmenuSectionToModal(newSection, sectionIndex);
}

// Agregar sección al modal del submenú
function addSubmenuSectionToModal(section, sectionIndex) {
    const container = document.getElementById('submenuSectionsContainer');
    
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'submenu-section-editor';
    sectionDiv.style.cssText = `
        border: 2px solid #17a2b8;
        border-radius: 10px;
        padding: 20px;
        margin: 15px 0;
        background: #f0f8ff;
    `;
    
    sectionDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h5>🔗 Sección ${sectionIndex + 1}</h5>
            <button type="button" class="btn btn-sm btn-warning" onclick="removeSubmenuSection(this)">
                <i class="fas fa-trash"></i> Eliminar Sección
            </button>
        </div>
        <div class="form-group">
            <label>Título de la Sección:</label>
            <input type="text" class="submenu-section-title" value="${section.title}" placeholder="ej: Sobre Nosotros, Servicios">
        </div>
        <div class="submenu-rows-container">
            ${section.rows.map((row, rowIndex) => createSubmenuRowHTML(row, rowIndex)).join('')}
        </div>
        <button type="button" class="btn btn-sm btn-info" onclick="addSubmenuRow(this)">
            <i class="fas fa-plus"></i> Agregar Opción
        </button>
    `;
    
    container.appendChild(sectionDiv);
}

// Crear HTML para una opción del submenú
function createSubmenuRowHTML(row, rowIndex) {
    return `
        <div class="submenu-row-editor" style="border: 1px solid #17a2b8; border-radius: 8px; padding: 15px; margin: 10px 0; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Opción ${rowIndex + 1}</strong>
                <button type="button" class="btn btn-sm btn-warning" onclick="removeSubmenuRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label>ID:</label>
                    <input type="text" class="submenu-row-id" value="${row.id}" placeholder="ej: historia_empresa">
                </div>
                <div>
                    <label>Título:</label>
                    <input type="text" class="submenu-row-title" value="${row.title}" placeholder="ej: 📜 Historia de la Empresa">
                </div>
            </div>
            <div style="margin-top: 10px;">
                <label>Descripción:</label>
                <input type="text" class="submenu-row-description" value="${row.description}" placeholder="Descripción opcional">
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <label><strong>Configurar Respuesta:</strong></label>
                <button type="button" class="btn btn-sm btn-success" onclick="configureSubmenuResponse('${row.id}', this)" style="margin-left: 10px;">
                    <i class="fas fa-cog"></i> Configurar Respuesta
                </button>
            </div>
        </div>
    `;
}

// Agregar nueva opción al submenú
function addSubmenuRow(button) {
    const rowsContainer = button.previousElementSibling;
    const rowIndex = rowsContainer.children.length;
    const newRowHTML = createSubmenuRowHTML({ id: '', title: '', description: '' }, rowIndex);
    
    const div = document.createElement('div');
    div.innerHTML = newRowHTML;
    rowsContainer.appendChild(div.firstElementChild);
}

// Remover sección del submenú
function removeSubmenuSection(button) {
    const sectionDiv = button.closest('.submenu-section-editor');
    sectionDiv.remove();
}

// Remover opción del submenú
function removeSubmenuRow(button) {
    const rowDiv = button.closest('.submenu-row-editor');
    rowDiv.remove();
}

// Guardar submenú
async function saveSubmenu() {
    const submenuId = document.getElementById('submenuId').value.trim();
    const title = document.getElementById('submenuTitle').value.trim();
    const description = document.getElementById('submenuDescription').value.trim();

    if (!submenuId || !title || !description) {
        showToast('Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    // Recopilar secciones
    const sections = [];
    const sectionElements = document.querySelectorAll('.submenu-section-editor');
    
    sectionElements.forEach(sectionEl => {
        const sectionTitle = sectionEl.querySelector('.submenu-section-title').value.trim();
        if (!sectionTitle) return;

        const rows = [];
        const rowElements = sectionEl.querySelectorAll('.submenu-row-editor');
        
        rowElements.forEach(rowEl => {
            const id = rowEl.querySelector('.submenu-row-id').value.trim();
            const rowTitle = rowEl.querySelector('.submenu-row-title').value.trim();
            const rowDescription = rowEl.querySelector('.submenu-row-description').value.trim();
            
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

    // Crear configuración del submenú
    const submenuConfig = {
        title,
        description,
        sections
    };

    // Asegurar que existe el objeto submenus
    if (!botConfig.submenus) {
        botConfig.submenus = {};
    }

    botConfig.submenus[submenuId] = submenuConfig;

    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botConfig)
        });

        if (response.ok) {
            showToast('Submenú guardado correctamente', 'success');
            closeSubmenuModal();
            loadLists();
        } else {
            throw new Error('Error guardando submenú');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error guardando submenú', 'error');
    }
}

// Configurar respuesta compleja para opción de submenú
function configureSubmenuResponse(optionId, button) {
    // Obtener el ID actual del input (puede haber cambiado)
    const rowDiv = button.closest('.submenu-row-editor');
    const actualId = rowDiv.querySelector('.submenu-row-id').value.trim();
    
    if (!actualId) {
        showToast('Primero debes asignar un ID a esta opción', 'warning');
        return;
    }
    
    openResponseConfigModal(actualId);
}

// Modal para configurar respuestas complejas
function openResponseConfigModal(optionId) {
    const modal = document.getElementById('responseConfigModal') || createResponseConfigModal();
    
    // Cargar respuesta actual si existe
    const currentResponse = botConfig.submenuResponses?.[optionId] || { type: 'text', message: '' };
    
    document.getElementById('responseOptionId').value = optionId;
    document.getElementById('responseTypeSelect').value = currentResponse.type || 'text';
    document.getElementById('responseMessage').value = currentResponse.message || '';
    document.getElementById('responseUrl').value = currentResponse.url || '';
    document.getElementById('responseUrlText').value = currentResponse.url_text || '';
    
    // Mostrar/ocultar campos según el tipo
    updateResponseFields();
    
    modal.classList.add('show');
}

function closeResponseConfigModal() {
    const modal = document.getElementById('responseConfigModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Crear modal para configurar respuestas
function createResponseConfigModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'responseConfigModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>🎯 Configurar Respuesta</h3>
                <button class="modal-close" onclick="closeResponseConfigModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="responseOptionId">
                
                <div class="form-group">
                    <label>Tipo de Respuesta:</label>
                    <select id="responseTypeSelect" onchange="updateResponseFields()">
                        <option value="text">📝 Texto Simple</option>
                        <option value="text_with_url">🔗 Texto con URL</option>
                        <option value="text_with_buttons">🔘 Texto con Botones</option>
                        <option value="text_with_submenu">📋 Texto con Submenú</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Mensaje:</label>
                    <textarea id="responseMessage" placeholder="Mensaje que enviará el bot" rows="4"></textarea>
                </div>
                
                <div class="form-group" id="urlFields" style="display: none;">
                    <label>URL:</label>
                    <input type="url" id="responseUrl" placeholder="https://ejemplo.com">
                    <label style="margin-top: 10px;">Texto del enlace:</label>
                    <input type="text" id="responseUrlText" placeholder="🌐 Ver más información">
                </div>
                
                <div class="form-group" id="buttonsFields" style="display: none;">
                    <label>Botones (máximo 3):</label>
                    <div id="buttonsContainer">
                        <div class="button-config">
                            <input type="text" placeholder="ID del botón" class="button-id">
                            <input type="text" placeholder="Texto del botón (máx 20 chars)" class="button-title">
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-info" onclick="addButtonConfig()">
                        <i class="fas fa-plus"></i> Agregar Botón
                    </button>
                </div>
                
                <div class="form-group" id="submenuFields" style="display: none;">
                    <label>Submenú a mostrar:</label>
                    <select id="responseSubmenu">
                        <option value="">Seleccionar submenú...</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeResponseConfigModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="saveResponseConfig()">Guardar Respuesta</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Actualizar campos según el tipo de respuesta
function updateResponseFields() {
    const type = document.getElementById('responseTypeSelect').value;
    
    document.getElementById('urlFields').style.display = type === 'text_with_url' ? 'block' : 'none';
    document.getElementById('buttonsFields').style.display = type === 'text_with_buttons' ? 'block' : 'none';
    document.getElementById('submenuFields').style.display = type === 'text_with_submenu' ? 'block' : 'none';
    
    // Cargar submenús disponibles
    if (type === 'text_with_submenu') {
        const select = document.getElementById('responseSubmenu');
        select.innerHTML = '<option value="">Seleccionar submenú...</option>';
        
        if (botConfig.submenus) {
            Object.keys(botConfig.submenus).forEach(submenuId => {
                const option = document.createElement('option');
                option.value = submenuId;
                option.textContent = botConfig.submenus[submenuId].title;
                select.appendChild(option);
            });
        }
    }
}

// Agregar configuración de botón
function addButtonConfig() {
    const container = document.getElementById('buttonsContainer');
    if (container.children.length >= 3) {
        showToast('WhatsApp permite máximo 3 botones', 'warning');
        return;
    }
    
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-config';
    buttonDiv.innerHTML = `
        <input type="text" placeholder="ID del botón" class="button-id">
        <input type="text" placeholder="Texto del botón (máx 20 chars)" class="button-title">
        <button type="button" class="btn btn-sm btn-warning" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(buttonDiv);
}

// Guardar configuración de respuesta
async function updateResponseFields() {
    const responseType = document.getElementById('responseTypeSelect').value;
    
    // Ocultar todos los campos específicos
    document.getElementById('urlFields').style.display = 'none';
    document.getElementById('buttonFields').style.display = 'none';
    document.getElementById('submenuFields').style.display = 'none';
    
    // Mostrar campos según el tipo seleccionado
    switch(responseType) {
        case 'text_with_url':
            document.getElementById('urlFields').style.display = 'block';
            break;
        case 'text_with_buttons':
            document.getElementById('buttonFields').style.display = 'block';
            break;
        case 'text_with_submenu':
            document.getElementById('submenuFields').style.display = 'block';
            loadSubmenuOptions(); // Cargar lista de submenús disponibles
            break;
    }
}

function loadSubmenuOptions() {
    const submenuSelect = document.getElementById('responseSubmenu');
    submenuSelect.innerHTML = '<option value="">Seleccionar submenú...</option>';
    
    // Cargar submenús disponibles
    fetch('/api/config')
        .then(response => response.json())
        .then(data => {
            if (data.submenus) {
                Object.keys(data.submenus).forEach(submenuId => {
                    const option = document.createElement('option');
                    option.value = submenuId;
                    option.textContent = `${submenuId} - ${data.submenus[submenuId].title}`;
                    submenuSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error cargando submenús:', error);
        });
}

function saveResponseConfig() {
    const optionId = document.getElementById('responseOptionId').value;
    const type = document.getElementById('responseTypeSelect').value;
    const message = document.getElementById('responseMessage').value.trim();
    
    if (!message) {
        showToast('El mensaje es obligatorio', 'error');
        return;
    }
    
    const responseConfig = {
        type: type,
        message: message
    };
    
    // Agregar campos específicos según el tipo
    switch (type) {
        case 'text_with_url':
            responseConfig.url = document.getElementById('responseUrl').value.trim();
            responseConfig.url_text = document.getElementById('responseUrlText').value.trim();
            break;
            
        case 'text_with_buttons':
            const buttons = [];
            document.querySelectorAll('.button-config').forEach(buttonDiv => {
                const id = buttonDiv.querySelector('.button-id').value.trim();
                const title = buttonDiv.querySelector('.button-title').value.trim();
                if (id && title) {
                    buttons.push({ id, title });
                }
            });
            responseConfig.buttons = buttons;
            break;
            
        case 'text_with_submenu':
            responseConfig.submenu = document.getElementById('responseSubmenu').value;
            break;
    }
    
    // Asegurar que existe el objeto submenuResponses
    if (!botConfig.submenuResponses) {
        botConfig.submenuResponses = {};
    }
    
    botConfig.submenuResponses[optionId] = responseConfig;
    
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botConfig)
        });

        if (response.ok) {
            showToast(`Respuesta configurada para "${optionId}"`, 'success');
            closeResponseConfigModal();
        } else {
            throw new Error('Error guardando respuesta');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error guardando respuesta', 'error');
    }
}

// Actualización automática del estado cada 30 segundos
setInterval(loadBotStatus, 30000);
