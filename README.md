# PriorityFlow - Gestor de Prioridade

**Projeto desenvolvido para a Avaliação Prática do Processo Seletivo 02521/2025 - Analista de Qualidade de Software - Júnior**

## 1. Configuração e Execução

### Pré-requisitos

* Node.js >= 18
* PostgreSQL >= 15
* Docker (opcional, para ambiente isolado)

### Instalação e execução local

```bash
# Backend
cd backend
npm install
npm start

# Frontend
Acesse http://localhost:3000 no navegador
```

### Execução via Docker

```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Rodar em background
docker-compose up -d --build

# Parar e remover containers
docker-compose down

# Limpar containers + volumes
docker-compose down -v
```

### Testes

```bash
# Testes unitários (Backend)
cd backend; npm test

# Testes de Fumaça (Cypress)
npm run cypress:open    # Interface gráfica
npm run cypress:run     # Execução headless (recomendado)
npx cypress run --spec cypress/e2e/smoke.cy.js --headless  # Execução específica do arquivo de fumaça

# Testes E2E (Playwright) - Legado
npx playwright install
npx playwright test tests/e2e.spec.js
```

**Nota sobre Cypress:** Os testes de fumaça são executados com banco de dados limpo antes de cada teste para garantir isolamento e consistência. Certifique-se de que o backend esteja rodando na porta 3000. Os testes cobrem:
- Carregamento da página inicial
- Criação de tickets
- Processamento da fila pendente
- Classificação por urgência com cores corretas
- Validação de campos obrigatórios

---

## 2. Decisões de Desenvolvimento

* **Linguagem backend**: Node.js + Express
* **Banco de dados**: PostgreSQL 15
* **Frontend**: HTML5, CSS3, JavaScript (vanilla)
* **Estrutura**: Backend separado do frontend, comunicação via API REST
* **Tratamento de erros frontend**: mensagens amigáveis ao usuário, validação básica de formulário
* **Processamento de tickets**: lógica central de SLA aplicada no backend, atualiza status e urgência

---

## 3. Plano de Testes

### Tipos de testes realizados

* **Caixa preta**: criação de tickets, processamento de fila, visualização de urgência
* **Caixa branca**: cobertura da lógica de SLA, testes de funções do backend
* **Categorias**:

  * Unitários
  * E2E
  * Testes manuais

### Estratégia e prioridades

* Validar regras de negócio críticas primeiro (SLA/urgência)
* Garantir feedback correto ao usuário na interface
* Testar integração entre frontend e backend

### Bugs identificados e corrigidos

* Texto “Cen�rio” e caracteres corrompidos: Parece que o encoding do título dos tickets não está sendo tratado corretamente (acentos). Isso precisa ser corrigido para exibir “Cenário” corretamente.
* Urgência sem destaque de cor: O ticket com urgência MEDIA não está destacando a cor. Cada nível de urgência deve ter sua cor distinta.

---

## 4. Especificações em Gherkin

```gherkin
Feature: Gestão de Tickets
  Scenario: Criar ticket PREMIUM com palavra 'parado'
    Given que estou na tela de gestão
    When eu criar um ticket PREMIUM com descrição 'sistema parado'
    And clicar em "Processar Fila Pendente"
    Then o ticket deve aparecer na lista Classificada com urgência CRITICA

  Scenario: Criar ticket BASICO sem palavras-chave
    Given que estou na tela de gestão
    When eu criar um ticket BASICO sem palavras-chave
    And clicar em "Processar Fila Pendente"
    Then o ticket deve aparecer na lista Classificada com urgência BAIXA
```

*Localização da documentação Gherkin:* `docs/gherkin.feature`

---

## 5. Requisitos Não Atendidos / Melhorias

* Pontos de melhoria identificados:

  * Validação de formulário mais robusta
  * Implementar autenticação/segurança
  * Integração com frontend framework (React/Vue)
  * Logs e monitoramento de backend
  * Requisitos não atendidos:

  * [RQNF7] Testes de integração backend (opcional)

---

## 6. Casos de Teste (Resumido)

* Ticket PREMIUM com palavra "parado" → urgência CRITICA
* Ticket BASICO com palavra "parado" → urgência ALTA
* Ticket GRATUITO com palavra "lento" → urgência BAIXA
* Ticket PREMIUM com "dúvida" e "não funciona" → urgência CRITICA
* Ticket BASICO sem palavras-chave → urgência BAIXA
* Ticket PREMIUM com "AJUDA" → urgência MEDIA

---

# Relatório SonarQube / SonarCloud

Foi realizada análise de qualidade de código utilizando o SonarCloud.  
Resumo da análise:

- Linhas de código: 1,6 mil  
- Confiabilidade: 4 questões em aberto  
- Manutenibilidade: 10 questões em aberto  
- Duplicações: 5,7%  
- Pontos de acesso de segurança: 5  

**Prioridade de ajustes**:  
1. Corrigir questões de confiabilidade (impacto médio, melhora a robustez)  
2. Revisar problemas de manutenibilidade (impacto médio, melhora manutenção futura)  
3. Avaliar duplicações e pontos de acesso de segurança (baixo esforço, melhora qualidade geral)

> Observação: Nenhum ajuste foi aplicado no código; análise realizada apenas para documentação.

---

[PriorityFlow](https://github.com/higorber/PriorityFlow)

---
