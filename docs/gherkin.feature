Feature: Gestor de Prioridade - Triagem de Tickets

  Como usuário do sistema de HelpDesk
  Quero criar tickets e visualizar filas de prioridade
  Para gerenciar eficientemente o suporte aos clientes

  Background:
    Given que estou na página inicial do Gestor de Prioridade

  Scenario: Criar um novo ticket
    When preencho o formulário com título "Sistema lento", descrição "O sistema está muito lento hoje" e tipo "PREMIUM"
    And clico em "Criar Ticket"
    Then o ticket deve aparecer na "Fila Pendente"
    And devo ver a mensagem "Ticket criado com sucesso!"

  Scenario: Processar fila de tickets pendentes
    Given que existem tickets na fila pendente
    When clico em "Processar Fila Pendente"
    Then os tickets devem ser movidos para "Fila Classificada"
    And cada ticket deve ter uma urgência calculada baseada nas regras de negócio
    And devo ver a mensagem "Fila processada com sucesso!"

  Scenario: Visualizar tickets classificados por urgência
    Given que existem tickets classificados
    When visualizo a "Fila Classificada"
    Then os tickets devem estar organizados por urgência
    And tickets críticos devem ter destaque visual vermelho
    And tickets altos devem ter destaque visual amarelo
    And tickets médios devem ter destaque visual azul
    And tickets baixos devem ter destaque visual verde

  Scenario: Validação de campos obrigatórios
    When tento criar um ticket sem preencher os campos obrigatórios
    Then devo ver mensagens de erro indicando os campos necessários
    And o ticket não deve ser criado

  Scenario: Cálculo de urgência para cliente PREMIUM com palavra crítica
    When crio um ticket com descrição contendo "parado" para cliente "PREMIUM"
    And processo a fila
    Then o ticket deve ser classificado como "CRITICA"

  Scenario: Cálculo de urgência para cliente BASICO com palavra crítica
    When crio um ticket com descrição contendo "offline" para cliente "BASICO"
    And processo a fila
    Then o ticket deve ser classificado como "ALTA"

  Scenario: Prioridade de palavras-chave (crítica prevalece sobre média)
    When crio um ticket com descrição "Tenho uma dúvida sobre porque o sistema está parado" para cliente "PREMIUM"
    And processo a fila
    Then o ticket deve ser classificado como "CRITICA"
