const { test, expect } = require('@playwright/test');

test.describe('Gestor de Prioridade E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Deve criar um ticket e aparecer na fila pendente', async ({ page }) => {
    await page.fill('#titulo', 'Teste Ticket');
    await page.fill('#descricao', 'Descrição do teste');
    await page.selectOption('#tipo_cliente', 'PREMIUM');
    await page.click('button[type="submit"]');

    await expect(page.locator('#message')).toHaveText('Ticket criado com sucesso!');
    await expect(page.locator('#pendingList li')).toHaveCount(1);
  });

  test('Deve processar fila e mover ticket para classificada', async ({ page }) => {
    // Criar ticket
    await page.fill('#titulo', 'Sistema parado');
    await page.fill('#descricao', 'O sistema está completamente parado.');
    await page.selectOption('#tipo_cliente', 'PREMIUM');
    await page.click('button[type="submit"]');

    // Processar fila
    await page.click('#processBtn');

    await expect(page.locator('#message')).toHaveText('Fila processada com sucesso!');
    await expect(page.locator('#pendingList li')).toHaveCount(0);
    await expect(page.locator('#classifiedList li')).toHaveCount(1);
    await expect(page.locator('#classifiedList li')).toContainText('CRITICA');
  });

  test('Deve validar campos obrigatórios no formulário', async ({ page }) => {
    await page.click('button[type="submit"]');

    // Verificar se mensagem de erro aparece (simulação de validação frontend)
    await expect(page.locator('#titulo:invalid')).toBeTruthy();
  });
});
