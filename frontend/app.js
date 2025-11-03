/**
 * PriorityFlow - Dashboard de Triagem de Tickets
 *
 * Lógica da aplicação:
 * - Tickets são criados via formulário e adicionados à "Fila Pendente"
 * - O botão "Processar Fila Pendente" classifica todos os tickets pendentes
 * - A prioridade é determinada pela combinação de palavras-chave na descrição + tipo de cliente (SLA)
 * - Tickets classificados são movidos para "Fila Classificada" com badges visuais
 */

// Inicialização da aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carrega tickets existentes via API
    loadTickets();

    // Configura event listeners para interações do usuário
    const form = document.getElementById('ticketForm');
    form.addEventListener('submit', createTicket);

    const processBtn = document.getElementById('processBtn');
    processBtn.addEventListener('click', processQueue);
});

/**
 * Carrega e exibe todos os tickets na interface via API
 * Ordena por data de criação (mais recentes primeiro)
 */
async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        if (!response.ok) throw new Error('Erro ao carregar tickets');
        const tickets = await response.json();
        displayTickets(tickets);
    } catch (error) {
        console.error('Erro ao carregar tickets:', error);
        showMessage('Erro ao carregar tickets. Tente novamente.', 'error');
    }
}

/**
 * Renderiza os tickets na interface, separando-os em filas
 * @param {Array} tickets - Array de objetos ticket
 */
function displayTickets(tickets) {
    // Seleciona os containers das filas
    const pendingList = document.getElementById('pendingList');
    const classifiedList = document.getElementById('classifiedList');

    // Limpa o conteúdo anterior
    pendingList.innerHTML = '';
    classifiedList.innerHTML = '';

    // Ordena tickets por data de criação (mais recentes primeiro)
    const sortedTickets = tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Filtra tickets por status
    const pendingTickets = sortedTickets.filter(ticket => ticket.status === 'PENDENTE');
    const classifiedTickets = sortedTickets.filter(ticket => ticket.status === 'CLASSIFICADO');

    // Exibe estado vazio na fila classificada se não houver tickets
    if (classifiedTickets.length === 0) {
        classifiedList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="#94A3B8" stroke="#1E293B" stroke-width="0.5"/>
                </svg>
                <p>Nenhum ticket classificado. Clique em 'Processar Fila' para começar.</p>
            </div>
        `;
    }

    // Renderiza tickets pendentes (sem badge de prioridade)
    pendingTickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div>
                <div class="ticket-title">${ticket.titulo}</div>
                <div class="ticket-client">Cliente: ${ticket.tipo_cliente.charAt(0).toUpperCase() + ticket.tipo_cliente.slice(1).toLowerCase()}</div>
            </div>
        `;
        pendingList.appendChild(card);
    });

    // Renderiza tickets classificados (com badge de prioridade)
    classifiedTickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div>
                <div class="ticket-title">${ticket.titulo}</div>
                <div class="ticket-client">Cliente: ${ticket.tipo_cliente.charAt(0).toUpperCase() + ticket.tipo_cliente.slice(1).toLowerCase()}</div>
            </div>
            <div class="urgency-badge ${ticket.urgencia_calculada.toLowerCase()}">${ticket.urgencia_calculada}</div>
        `;
        classifiedList.appendChild(card);
    });
}

/**
 * Cria um novo ticket a partir do formulário via API
 * @param {Event} event - Evento de submit do formulário
 */
async function createTicket(event) {
    // Previne o comportamento padrão do formulário (recarregar página)
    event.preventDefault();

    // Limpa mensagens de erro anteriores
    document.getElementById('tituloError').style.display = 'none';
    document.getElementById('descricaoError').style.display = 'none';

    // Coleta valores do formulário
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const tipo_cliente = document.getElementById('tipo_cliente').value;

    // Validação frontend obrigatória
    let hasError = false;
    if (!titulo) {
        document.getElementById('tituloError').textContent = 'Título é obrigatório';
        document.getElementById('tituloError').style.display = 'block';
        hasError = true;
    }
    if (!descricao) {
        document.getElementById('descricaoError').textContent = 'Descrição é obrigatória';
        document.getElementById('descricaoError').style.display = 'block';
        hasError = true;
    }

    // Para se houver erros de validação
    if (hasError) return;

    // Desabilita botão e mostra loading
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Criando...';

    try {
        const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao, tipo_cliente })
        });

        if (!response.ok) throw new Error('Erro ao criar ticket');

        const data = await response.json();

        // Limpa formulário
        event.target.reset();
        // Mostra mensagem de sucesso
        showMessage(data.message || 'Ticket criado com sucesso!', 'success');
        // Recarrega a lista de tickets
        loadTickets();
    } catch (error) {
        console.error('Erro ao criar ticket:', error);
        showMessage('Erro ao criar ticket. Tente novamente.', 'error');
    } finally {
        // Reabilita botão
        submitBtn.disabled = false;
        submitBtn.textContent = 'Criar Ticket';
    }
}

/**
 * Processa todos os tickets pendentes via API, atribuindo prioridade e movendo para fila classificada
 */
async function processQueue() {
    // Seleciona o botão de processamento
    const processBtn = document.getElementById('processBtn');

    // Verifica se há tickets pendentes
    const pendingTickets = document.querySelectorAll('#pendingList .ticket-card');
    if (pendingTickets.length === 0) {
        showMessage('Não há tickets pendentes para processar.', 'error');
        return;
    }

    // Desabilita botão e mostra estado de loading
    processBtn.disabled = true;
    processBtn.setAttribute('aria-busy', 'true');
    processBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spinner">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                <animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" values="31.416;0"/>
            </circle>
        </svg>
        Processando fila...
    `;

    try {
        const response = await fetch('/api/processar', { method: 'POST' });

        if (!response.ok) throw new Error('Erro ao processar fila');

        // Mostra mensagem de sucesso
        showMessage('Fila processada com sucesso!', 'success');

        // Recarrega interface
        loadTickets();
    } catch (error) {
        console.error('Erro ao processar fila:', error);
        showMessage('Erro ao processar fila. Tente novamente.', 'error');
    } finally {
        // Reabilita botão e restaura aparência
        processBtn.disabled = false;
        processBtn.removeAttribute('aria-busy');
        processBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
            Processar Fila Pendente
        `;
    }
}



/**
 * Exibe uma mensagem temporária na interface
 * @param {string} text - Texto da mensagem
 * @param {string} type - Tipo da mensagem ('success' ou 'error')
 */
function showMessage(text, type) {
    // Seleciona o container de mensagens
    const messageDiv = document.getElementById('message');

    // Define o texto e classe CSS
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;

    // Mostra a mensagem
    messageDiv.style.display = 'block';

    // Oculta automaticamente após 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
