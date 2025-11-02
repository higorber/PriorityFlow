# Relatório de Bug - Gestor de Prioridade

## Bug ID: BUG-001

## Título
Validação insuficiente de campos obrigatórios no formulário de criação de tickets

## Descrição
O formulário de criação de tickets permite submissão com campos vazios, resultando em tickets inválidos sendo criados no banco de dados.

## Passos para Reproduzir
1. Acessar a página inicial da aplicação
2. Deixar os campos "Título", "Descrição" e "Tipo de Cliente" vazios
3. Clicar no botão "Criar Ticket"
4. Observar que o ticket é criado mesmo com campos vazios

## Comportamento Esperado
- O formulário deve validar campos obrigatórios antes da submissão
- Deve exibir mensagens de erro para campos não preenchidos
- Não deve permitir criação de tickets com dados inválidos

## Comportamento Atual
- Ticket é criado com valores vazios/null
- Nenhum feedback de erro é exibido ao usuário
- Dados inconsistentes são persistidos no banco

## Severidade
Alta - Afeta a integridade dos dados e pode impactar cálculos de SLA

## Prioridade
Alta - Deve ser corrigido antes do deploy em produção

## Ambiente
- Browser: Chrome 120.0.6099.109
- SO: Windows 11
- Aplicação: Gestor de Prioridade v1.0.0

## Evidências
- Screenshot do formulário submetido com campos vazios
- Log do banco mostrando inserção com valores vazios

## Notas Adicionais
Este bug foi identificado durante testes manuais exploratórios. Recomenda-se implementar validação tanto no frontend (JavaScript) quanto no backend (Node.js) para defesa em profundidade.
