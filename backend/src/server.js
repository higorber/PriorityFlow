require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || (process.env.NODE_ENV === 'test' ? 3005 : 3000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

module.exports = app;
