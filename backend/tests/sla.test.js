const { calculateUrgency } = require('../server');

// Set NODE_ENV to test to use port 3005
process.env.NODE_ENV = 'test';

describe('SLA Calculation', () => {
  test('Premium - Crítica (Palavra-chave \'parado\')', () => {
    const result = calculateUrgency('Meu sistema está completamente parado e não consigo trabalhar.', 'PREMIUM');
    expect(result).toBe('CRITICA');
  });

  test('Premium - Alta (Palavra-chave \'lento\')', () => {
    const result = calculateUrgency('O relatório de vendas está muito lento hoje.', 'PREMIUM');
    expect(result).toBe('ALTA');
  });

  test('Premium - Média (Palavra-chave \'dúvida\')', () => {
    const result = calculateUrgency('Tenho uma dúvida sobre como fazer a integração.', 'PREMIUM');
    expect(result).toBe('MEDIA');
  });

  test('Premium - Sem Palavra-chave (Default)', () => {
    const result = calculateUrgency('O último chamado foi resolvido, obrigado.', 'PREMIUM');
    expect(result).toBe('MEDIA');
  });

  test('Basico - Crítica -> Rebaixa para ALTA', () => {
    const result = calculateUrgency('Meu aplicativo está fora do ar.', 'BASICO');
    expect(result).toBe('ALTA');
  });

  test('Basico - Alta -> Rebaixa para MEDIA', () => {
    const result = calculateUrgency('Recebendo um erro 500 ao tentar salvar o formulário.', 'BASICO');
    expect(result).toBe('MEDIA');
  });

  test('Basico - Sem Palavra-chave (Default)', () => {
    const result = calculateUrgency('Gostaria de sugerir uma nova cor para o botão.', 'BASICO');
    expect(result).toBe('BAIXA');
  });

  test('Gratuito - Crítica -> Rebaixa para MEDIA', () => {
    const result = calculateUrgency('O sistema está parado, não faz login.', 'GRATUITO');
    expect(result).toBe('MEDIA');
  });

  test('Gratuito - Alta -> Rebaixa para BAIXA', () => {
    const result = calculateUrgency('Encontrei um bug na tela de login, o texto está cortado.', 'GRATUITO');
    expect(result).toBe('BAIXA');
  });

  test('Gratuito - Média -> Rebaixa para BAIXA', () => {
    const result = calculateUrgency('Preciso de ajuda para encontrar a documentação.', 'GRATUITO');
    expect(result).toBe('BAIXA');
  });

  test('Regra de Prioridade (Crítica > Média) - RN004.2', () => {
    const result = calculateUrgency('Tenho uma dúvida sobre porque o sistema está parado.', 'PREMIUM');
    expect(result).toBe('CRITICA');
  });

  test('Teste de Case Insensitive (lento vs LENTO)', () => {
    const result = calculateUrgency('O sistema está LENTO demais.', 'PREMIUM');
    expect(result).toBe('ALTA');
  });
});
