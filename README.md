# PriorityFlow - Gestor de Prioridade

Sistema web moderno para triagem automática de tickets de HelpDesk, calculando urgência (SLA) baseada em regras de negócio específicas.

## 🎨 Interface

Layout idêntico à imagem fornecida: duas colunas principais com formulário à esquerda e dashboard de triagem à direita. Design profissional, responsivo e intuitivo.

## ⚙️ Tecnologias

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Testes**: Jest (unitários) + Playwright (E2E)
- **Containerização**: Docker + Docker Compose

## 🚀 Instalação e Execução

### Local (Desenvolvimento)

```bash
# Backend
cd backend
npm install
npm start

# Frontend acessível em http://localhost:3000
```

### Docker (Produção/Isolamento)

```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Ou rodar em background
docker-compose up -d --build

# Parar e remover containers
docker-compose down

# Parar e remover containers + volumes (limpa dados)
docker-compose down -v
```

**Serviços Docker:**
- **Backend**: Node.js + Express (porta 3000)
- **Database**: PostgreSQL 15 (porta 5432)
- **Frontend**: Servido estáticamente pelo backend

**Acesso:**
- Aplicação: http://localhost:3000
- PostgreSQL: localhost:5432 (para conexões externas se necessário)

## 🧮 Regras de Negócio (SLA)

A urgência é calculada baseada em uma matriz de decisão que combina palavras-chave na descrição do ticket com o tipo de cliente:

| Cliente   | Palavra Crítica | Palavra Alta | Palavra Média | Nenhuma |
|-----------|-----------------|--------------|---------------|---------|
| **Premium** | CRÍTICA        | ALTA        | MÉDIA        | MÉDIA  |
| **Básico**  | ALTA          | MÉDIA       | BAIXA        | BAIXA  |
| **Gratuito**| MÉDIA         | BAIXA       | BAIXA        | BAIXA  |

**Palavras-chave** (case-insensitive):
- **Críticas**: parado, offline, não funciona, down, fora do ar
- **Altas**: erro, bug, lento, lentidão, falha de acesso
- **Médias**: dúvida, como fazer, ajuda, orientação

### Teste Manual das Regras SLA

Para testar manualmente:
1. Crie um ticket com descrição contendo "sistema parado" para cliente PREMIUM
2. Clique em "Processar Fila Pendente"
3. Verifique se o ticket aparece na fila classificada com urgência "CRÍTICA" (badge vermelho)

## 📋 Funcionalidades

- ✅ Criar tickets via formulário com validação
- ✅ Visualizar filas pendente/classificada
- ✅ Processar fila com cálculo automático de urgência
- ✅ Interface responsiva com cards e badges coloridos
- ✅ Estados de carregamento e feedback visual
- ✅ Acessibilidade (A11y) com labels e ARIA

## 🧮 Regras de Negócio (Matriz de Decisão)

| Cliente   | Palavra Crítica | Palavra Alta | Palavra Média | Nenhuma |
|-----------|-----------------|--------------|---------------|---------|
| **Premium** | CRÍTICA        | ALTA        | MÉDIA        | MÉDIA  |
| **Básico**  | ALTA          | MÉDIA       | BAIXA        | BAIXA  |
| **Gratuito**| MÉDIA         | BAIXA       | BAIXA        | BAIXA  |

**Palavras-chave** (case-insensitive):
- **Críticas**: parado, offline, não funciona, down, fora do ar
- **Altas**: erro, bug, lento, lentidão, falha de acesso
- **Médias**: dúvida, como fazer, ajuda, orientação

## 🧪 Testes

```bash
# Unitários
cd backend && npm test

# E2E
npx playwright install
npx playwright test tests/e2e.spec.js
```

## 📚 Documentação

- **Gherkin Specs**: `docs/gherkin.feature`
- **Test Plan**: `docs/test-plan.md`
- **Bug Report**: `docs/bug-report.md`

## 🔧 Melhorias Futuras

- Validação frontend robusta
- Autenticação e autorização
- Framework frontend (React/Vue)
- Testes de integração
- Logs e monitoramento
- Cache e paginação

## 🐛 Bugs Conhecidos

- Validação de campos obrigatórios insuficiente no frontend (permite submissão vazia)

## 📊 Status dos Requisitos

- ✅ RQNF1-6, 8-9, 11-16: Implementados
- ❌ RQNF7: Testes de integração pendentes
- ❌ RQNF10: SonarQube não executado

## 📡 API Endpoints

### POST /api/tickets
Cria um novo ticket.

**Payload:**
```json
{
  "titulo": "string",
  "descricao": "string",
  "tipo_cliente": "GRATUITO|BASICO|PREMIUM"
}
```

**Response (201):**
```json
{
  "id": 1,
  "titulo": "string",
  "descricao": "string",
  "tipo_cliente": "GRATUITO",
  "status": "PENDENTE",
  "urgencia_calculada": null,
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

### GET /api/tickets
Retorna todos os tickets ordenados por data de criação (mais recentes primeiro).

**Response (200):**
```json
[
  {
    "id": 1,
    "titulo": "string",
    "descricao": "string",
    "tipo_cliente": "GRATUITO",
    "status": "PENDENTE|CLASSIFICADO",
    "urgencia_calculada": "CRITICA|ALTA|MEDIA|BAIXA",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /api/processar
Processa todos os tickets pendentes, calculando urgência e movendo para fila classificada.

**Response (200):**
```json
{
  "message": "Fila processada com sucesso"
}
```
