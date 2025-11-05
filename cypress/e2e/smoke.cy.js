  describe('PriorityFlow - Smoke Tests', () => {
  beforeEach(() => {
    // Clear database before each test
    cy.request('DELETE', '/api/tickets/clear').then((response) => {
      // Ignore if endpoint doesn't exist, just continue
    })
    cy.visit('/')
  })

  it('should load the application homepage', () => {
    cy.contains('Dashboard de Triagem').should('be.visible')
    cy.get('#ticketForm').should('be.visible')
    cy.get('#pendingList').should('be.visible')
    cy.get('#classifiedList').should('be.visible')
    cy.get('#processBtn').should('be.visible')
  })

  it('should create a new ticket successfully', () => {
    // Intercept API call
    cy.intercept('POST', '/api/tickets').as('createTicket')

    // Fill form
    cy.get('#titulo').type('Teste de Fumaça - Sistema Lento')
    cy.get('#descricao').type('O sistema está muito lento hoje, impactando o trabalho.')
    cy.get('#tipo_cliente').select('PREMIUM')

    // Submit form
    cy.get('#submitBtn').click()

    // Wait for API response
    cy.wait('@createTicket')

    // Wait for UI update
    cy.wait(2000)

    // Verify success message
    cy.get('#message').should('contain', 'Ticket criado com sucesso!')

    // Verify ticket appears in pending list
    cy.get('#pendingList .ticket-card').should('have.length.at.least', 1)
    cy.get('#pendingList .ticket-card').first().should('contain', 'Teste de Fumaça')
  })

  it('should process pending queue and classify tickets', () => {
    // Intercept API calls
    cy.intercept('POST', '/api/tickets').as('createTicket')
    cy.intercept('POST', '/api/processar').as('processQueue')

    // First create a ticket
    cy.get('#titulo').type('Sistema Parado')
    cy.get('#descricao').type('O sistema está completamente parado e não consigo trabalhar.')
    cy.get('#tipo_cliente').select('PREMIUM')
    cy.get('#submitBtn').click()

    // Wait for ticket creation
    cy.wait('@createTicket')
    cy.wait(2000)
    cy.get('#message').should('contain', 'Ticket criado com sucesso!')

    // Process queue
    cy.get('#processBtn').click()

    // Wait for processing
    cy.wait('@processQueue')
    cy.wait(2000)

    // Verify processing message
    cy.get('#message').should('contain', 'Fila processada com sucesso!')

    // Verify ticket moved to classified list
    cy.get('#pendingList .ticket-card').should('have.length', 0)
    cy.get('#classifiedList .ticket-card').should('have.length.at.least', 1)

    // Verify urgency badge is present
    cy.get('#classifiedList .ticket-card').first().find('.urgency-badge').should('be.visible')
  })

  it('should display correct urgency levels with colors', () => {
    // Intercept API calls
    cy.intercept('POST', '/api/tickets').as('createTicket')
    cy.intercept('POST', '/api/processar').as('processQueue')

    // Create tickets with different client types
    const tickets = [
      { title: 'Premium Critical', desc: 'Sistema parado', type: 'PREMIUM', expectedUrgency: 'CRITICA', expectedColor: 'rgb(220, 53, 69)' },
      { title: 'Basic High', desc: 'Erro crítico', type: 'BASICO', expectedUrgency: 'MEDIA', expectedColor: 'rgb(255, 193, 7)' },
      { title: 'Free Low', desc: 'Dúvida simples', type: 'GRATUITO', expectedUrgency: 'BAIXA', expectedColor: 'rgb(40, 167, 69)' },
      { title: 'Premium Medium', desc: 'Preciso de ajuda', type: 'PREMIUM', expectedUrgency: 'MEDIA', expectedColor: 'rgb(255, 193, 7)' }
    ]

    // FIX: Replace forEach with for...of for better performance and readability
    for (const ticket of tickets) {
      cy.get('#titulo').type(ticket.title)
      cy.get('#descricao').type(ticket.desc)
      cy.get('#tipo_cliente').select(ticket.type)
      cy.get('#submitBtn').click()
      cy.wait('@createTicket')
      cy.wait(2000)
      cy.get('#message').should('contain', 'Ticket criado com sucesso!')
    }

    // Process queue
    cy.get('#processBtn').click()
    cy.wait('@processQueue')
    cy.wait(2000)
    cy.get('#message').should('contain', 'Fila processada com sucesso!')

    // Verify all tickets are classified
    cy.get('#classifiedList .ticket-card').should('have.length', tickets.length)

    // FIX: Move sort operation to separate line for better readability and performance
    const priorityOrder = { 'CRITICA': 4, 'ALTA': 3, 'MEDIA': 2, 'BAIXA': 1 };
    const sortedTickets = tickets.slice().sort((a, b) => {
      const priorityA = priorityOrder[a.expectedUrgency] || 0;
      const priorityB = priorityOrder[b.expectedUrgency] || 0;
      return priorityB - priorityA;
    });

    // Check urgency badges with correct colors in priority order
    cy.get('.urgency-badge').each(($badge, index) => {
      cy.wrap($badge).should('be.visible')
      cy.wrap($badge).should('contain', sortedTickets[index].expectedUrgency)
      cy.wrap($badge).should('have.css', 'background-color', sortedTickets[index].expectedColor)
    }).then(() => {
      // Additional check for the specific badge classes
      cy.get('.urgency-badge.critica').should('contain', 'CRITICA')
      cy.get('.urgency-badge.media').should('contain', 'MEDIA')
      cy.get('.urgency-badge.baixa').should('contain', 'BAIXA')
    })
  })

  it('should validate required form fields', () => {
    // Try to submit empty form
    cy.get('#submitBtn').click()

    // Wait for validation to trigger
    cy.wait(1000)

    // Check that error messages appear
    cy.get('#tituloError').should('be.visible')
    cy.get('#descricaoError').should('be.visible')
    cy.get('#tipoClienteError').should('be.visible')

    // Verify no ticket was created
    cy.get('#pendingList .ticket-card').should('have.length', 0)
  })
})
