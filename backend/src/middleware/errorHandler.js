const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 'ECONNREFUSED') {
    return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
  }

  res.status(500).json({ error: 'Erro interno do servidor' });
};

module.exports = errorHandler;
