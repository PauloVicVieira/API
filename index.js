const express = require("express");
const rotas = require("./rotas"); // Importe suas rotas

const app = express();
const port = 3001;

app.use(express.json());

// Use as rotas do arquivo rotas.js
app.use("/", rotas);

app.listen(port, () => {
  console.log(`Iniciando o servidor na porta:${port}`);
});
