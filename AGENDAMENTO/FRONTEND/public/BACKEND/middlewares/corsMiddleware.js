const cors = require('cors');

const corsOptions = {
  origin: '*', // ajustar para os domínios que quer liberar
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
