# Plano de Testes - Gestor de Prioridade

## Estratégia de Testes

### Abordagem Geral
- **Caixa Branca**: Testes unitários focados na lógica de cálculo de SLA (função `calculateUrgency`).
- **Caixa Preta**: Testes E2E simulando interações do usuário real.
- **Priorização**: Foco em testes funcionais e de regressão, priorizando cenários críticos de negócio.

### Categorias de Testes
1. **Funcionais**: Validação das regras de negócio de cálculo de SLA.
2. **Não Funcionais**: Performance, usabilidade e segurança.
3. **Regressão**: Garantia de que mudanças não quebrem funcionalidades existentes.
4. **Exploratórios**: Testes manuais para descobrir comportamentos inesperados.

## Escopo dos Testes

### Testes Unitários (Jest)
- Cobertura completa da função `calculateUrgency` com todos os casos de teste fornecidos.
- Validação de case insensitive nas palavras-chave.
- Teste da regra de prioridade (palavra de maior impacto prevalece).

### Testes E2E (Playwright)
- Criação de tickets via formulário.
- Processamento da fila pendente.
- Validação de atualização das listas sem refresh.
- Verificação de feedback visual (cores por urgência).

### Testes Manuais
- Validação de usabilidade da interface.
- Testes de acessibilidade básica.
- Verificação de tratamento de erros.

## Cenários Gherkin

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

## Critérios de Aceitação
- Todos os testes unitários devem passar.
- Pelo menos 80% de cobertura de código nos testes unitários.
- Testes E2E devem cobrir os fluxos principais da aplicação.
- Interface deve ser responsiva e intuitiva.

## Ambiente de Testes
- **Banco de Dados**: PostgreSQL em container Docker.
- **Backend**: Node.js rodando localmente.
- **Frontend**: Navegador Chrome/Firefox.
- **Ferramentas**: Jest para unitários, Playwright para E2E.

## Métricas de Qualidade
- Cobertura de testes: >80%
- Tempo de execução dos testes: <30 segundos
- Taxa de sucesso: 100% para testes automatizados

## Riscos e Mitigações
- **Risco**: Dependência de banco de dados pode causar falhas intermitentes.
  - **Mitigação**: Usar transações e setup/teardown adequados nos testes.
- **Risco**: Testes E2E podem ser frágeis devido a mudanças na UI.
  - **Mitigação**: Usar seletores robustos e manter testes simples.

## Relatório de Bug Identificado
Durante testes manuais exploratórios, foi identificado um bug na validação do formulário: o frontend não impede a submissão de tickets com campos vazios, permitindo a criação de registros inválidos no banco de dados. Isso pode levar a inconsistências nos dados e afetar o cálculo de SLA.

### Bug ID: BUG-001

#### Título
Validação insuficiente de campos obrigatórios no formulário de criação de tickets

#### Descrição
O formulário de criação de tickets permite submissão com campos vazios, resultando em tickets inválidos sendo criados no banco de dados.

#### Passos para Reproduzir
1. Acessar a página inicial da aplicação
2. Deixar os campos "Título", "Descrição" e "Tipo de Cliente" vazios
3. Clicar no botão "Criar Ticket"
4. Observar que o ticket é criado mesmo com campos vazios

#### Comportamento Esperado
- O formulário deve validar campos obrigatórios antes da submissão
- Deve exibir mensagens de erro para campos não preenchidos
- Não deve permitir criação de tickets com dados inválidos

#### Comportamento Atual
- Ticket é criado com valores vazios/null
- Nenhum feedback de erro é exibido ao usuário
- Dados inconsistentes são persistidos no banco

#### Severidade
Alta - Afeta a integridade dos dados e pode impactar cálculos de SLA

#### Prioridade
Alta - Deve ser corrigido antes do deploy em produção

#### Ambiente
- Browser: Chrome 120.0.6099.109
- SO: Windows 11
- Aplicação: Gestor de Prioridade v1.0.0

#### Evidências
- Screenshot do formulário submetido com campos vazios
- Log do banco mostrando inserção com valores vazios

#### Notas Adicionais
Este bug foi identificado durante testes manuais exploratórios. Recomenda-se implementar validação tanto no frontend (JavaScript) quanto no backend (Node.js) para defesa em profundidade.
