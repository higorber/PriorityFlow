/**
 * Calculates the urgency level of a ticket based on description and client type.
 * @param {string} descricao - The ticket description.
 * @param {string} tipoCliente - The client type ('PREMIUM', 'BASICO', 'GRATUITO').
 * @returns {string} The urgency level ('CRITICA', 'ALTA', 'MEDIA', 'BAIXA').
 */
function calculateUrgency(descricao, tipoCliente) {
  const desc = descricao.toLowerCase();

  // Keywords for urgency levels
  const keywords = {
    critical: ['parado', 'offline', 'não funciona', 'down', 'fora do ar'],
    high: ['erro', 'bug', 'lento', 'lentidão', 'falha de acesso'],
    medium: ['dúvida', 'como fazer', 'ajuda', 'orientação']
  };

  // Determine priority based on keywords (highest priority wins)
  let priority;
  if (keywords.critical.some(word => desc.includes(word))) {
    priority = 3;
  } else if (keywords.high.some(word => desc.includes(word))) {
    priority = 2;
  } else if (keywords.medium.some(word => desc.includes(word))) {
    priority = 1;
  } else {
    priority = 0;
  }

  // Urgency matrix based on client type
  const urgencyMatrix = {
    PREMIUM: ['MEDIA', 'MEDIA', 'ALTA', 'CRITICA'],
    BASICO: ['BAIXA', 'MEDIA', 'MEDIA', 'ALTA'],
    GRATUITO: ['BAIXA', 'BAIXA', 'BAIXA', 'MEDIA']
  };

  return urgencyMatrix[tipoCliente]?.[priority] || 'BAIXA';
}

module.exports = { calculateUrgency };
