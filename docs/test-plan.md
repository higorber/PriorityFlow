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
