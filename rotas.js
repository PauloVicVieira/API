const express = require("express");
const axios = require("axios");

const router = express.Router();

var dados;
let ip = "177.102.215.216";

function getDataAtual() {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
  const dia = dataAtual.getDate().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function getHoraAtual() {
  const horaAtual = new Date().toLocaleTimeString();
  return horaAtual;
}

function local() {
  let url = `http://api.ipstack.com/${ip}?access_key=15e84f8fcb5574678c8acc19ec3a9b22&fields=country_code`;
  return axios.get(`${url}`, {
    params: {
      'fields': 'country_code,country_name,region_name,region_code,latitude,longitude,city'
    },
  });
}

dados = local();

router.get("/Api-Clima", (req, res) => {
  dados.then(function (clima) {
    const dataAtual = getDataAtual();
    const horaAtual = getHoraAtual();

    axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        'latitude': `${clima.data.latitude}`,
        'longitude': `${clima.data.longitude}`,
        'start_date': `${dataAtual}`,
        "end_date": `${dataAtual}`,
        "hourly": "temperature_2m"
      }
    }).then(function (resposta) {
      res.json(resposta.data);
    });
  });
});

router.get("/localizacao", (req, res) => {
  dados.then(function (resposta) {
    res.json(resposta.data);
  });
});

router.get("/info", (req, res) => {
  Promise.all([dados, local()]).then(([clima, resposta]) => {
    const dataAtual = getDataAtual();
    const horaAtual = getHoraAtual();

    const climaParams = {
      'latitude': `${resposta.data.latitude}`,
      'longitude': `${resposta.data.longitude}`,
      'start_date': `${dataAtual}`,
      "end_date": `${dataAtual}`,
      "hourly": "temperature_2m"
    };

    const climaRequest = axios.get(`https://api.open-meteo.com/v1/forecast`, { params: climaParams });

    Promise.all([climaRequest]).then(([climaResposta]) => {
      const responseData = {
        clima: climaResposta.data,
        localizacao: resposta.data,
        dataAtual: dataAtual,
        horaAtual: horaAtual
      };

      const horaDesejada = new Date().getHours();
      const horarios = responseData.clima.hourly.time;
      const temperaturas = responseData.clima.hourly.temperature_2m;
      const cidade = responseData.localizacao.city;

      if (horaDesejada < horarios.length) {
        const horario = horarios[horaDesejada];
        const temperatura = temperaturas[horaDesejada];
        res.json(`No dia de hoje ${dataAtual} são ${horaAtual}. Neste momento a temperatura na cidade de ${cidade} é de ${temperatura}°C.`);
      } else {
        console.log("Índice de hora inválido.");
      }
    });
  });
});

module.exports = router;
