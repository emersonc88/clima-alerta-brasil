const $ = (id) => document.getElementById(id);
const today = new Date();
$("today").textContent = today.toLocaleDateString("pt-BR", {weekday:"long", day:"2-digit", month:"long", year:"numeric"});
$("year").textContent = today.getFullYear();

const menuToggle = $("menuToggle");
const nav = $("mainNav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

const weatherCodes = {
  0:["Céu limpo","☀"],1:["Predominantemente limpo","🌤"],2:["Parcialmente nublado","⛅"],3:["Nublado","☁"],
  45:["Neblina","🌫"],48:["Neblina com geada","🌫"],51:["Garoa leve","🌦"],53:["Garoa moderada","🌦"],55:["Garoa intensa","🌧"],
  61:["Chuva leve","🌦"],63:["Chuva moderada","🌧"],65:["Chuva forte","🌧"],71:["Neve leve","🌨"],73:["Neve moderada","🌨"],75:["Neve forte","❄"],
  80:["Pancadas de chuva leves","🌦"],81:["Pancadas de chuva moderadas","🌧"],82:["Pancadas de chuva fortes","⛈"],
  95:["Trovoada","⛈"],96:["Trovoada com granizo","⛈"],99:["Trovoada forte com granizo","⛈"]
};
function describe(code){return weatherCodes[code] || ["Condição variável","🌤"];}
function setStatus(message, error=false){$("weatherStatus").textContent=message;$("weatherStatus").style.color=error?"#b54b42":"#6c8290";}
$("weatherForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = $("cityInput").value.trim();
  if(!city) return;
  $("weatherResult").hidden = true;
  setStatus("Buscando informações para " + city + "...");
  const button = $("weatherForm").querySelector("button");
  button.disabled = true; button.textContent = "Consultando...";
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    const geoResponse = await fetch(geoUrl);
    if(!geoResponse.ok) throw new Error("Não foi possível consultar a localização.");
    const geo = await geoResponse.json();
    if(!geo.results || !geo.results.length) throw new Error("Não encontramos essa cidade. Confira a escrita e tente novamente.");
    const place = geo.results[0];
    const params = new URLSearchParams({
      latitude:place.latitude, longitude:place.longitude,
      current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
      daily:"weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone:"auto", forecast_days:"5"
    });
    const response = await fetch("https://api.open-meteo.com/v1/forecast?" + params);
    if(!response.ok) throw new Error("Não foi possível obter a previsão neste momento.");
    const data = await response.json();
    renderWeather(place,data);
    $("weatherResult").hidden = false;
    setStatus("Consulta atualizada. Lembre-se de verificar os avisos oficiais da sua região.");
  } catch(error) {
    setStatus(error.message || "Ocorreu um erro. Tente novamente mais tarde.", true);
  } finally {
    button.disabled = false; button.textContent = "Consultar";
  }
});
function renderWeather(place,data){
  const c=data.current, d=data.daily, [description,icon]=describe(c.weather_code);
  $("weatherPlace").textContent = [place.name,place.admin1,place.country].filter(Boolean).join(" • ").toUpperCase();
  $("weatherIcon").textContent=icon;
  $("temperature").textContent=Math.round(c.temperature_2m)+"°";
  $("weatherDescription").textContent=description;
  $("weatherDetails").textContent=`Sensação de ${Math.round(c.apparent_temperature)}°C · Chuva atual: ${c.precipitation} mm`;
  $("humidity").textContent=Math.round(c.relative_humidity_2m)+"%";
  $("wind").textContent=Math.round(c.wind_speed_10m)+" km/h";
  $("maxmin").textContent=`${Math.round(d.temperature_2m_max[0])}° / ${Math.round(d.temperature_2m_min[0])}°`;
  $("forecast").innerHTML="";
  d.time.forEach((date,i)=>{
    const day = new Date(date+"T12:00:00");
    const label = i===0?"Hoje":day.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".","");
    const [desc,ico]=describe(d.weather_code[i]);
    const el=document.createElement("div");el.className="forecast-day";
    el.innerHTML=`<span>${label}</span><b>${ico}</b><strong>${Math.round(d.temperature_2m_max[i])}°</strong><small>${Math.round(d.temperature_2m_min[i])}° · chuva ${d.precipitation_probability_max[i] ?? "—"}%</small>`;
    el.title=desc;$("forecast").appendChild(el);
  });
}
/* CLIMA ALERTA GLOBAL - IDIOMAS */

const textosIdiomas = {
  pt: {
    menu: ["Previsão", "Alertas oficiais", "Entenda o clima", "Prevenção"],
    titulo: "O clima muda.<br><em>Esteja preparado.</em>",
    descricao: "Informação climática em linguagem simples para você entender o que está acontecendo e saber onde buscar orientações confiáveis.",
    previsao: "Como está o tempo na sua cidade?",
    instrucao: "Pesquise uma cidade para consultar as condições atuais e a previsão dos próximos dias.",
    campo: "Digite uma cidade (ex.: Campinas)",
    botao: "Consultar"
  },
  en: {
    menu: ["Forecast", "Official alerts", "Learn about climate", "Safety"],
    titulo: "Weather changes.<br><em>Be prepared.</em>",
    descricao: "Clear weather information to help you understand conditions and find reliable official guidance.",
    previsao: "What's the weather like in your city?",
    instrucao: "Search for a city to see current conditions and the forecast.",
    campo: "Enter a city (e.g., London)",
    botao: "Search"
  },
  es: {
    menu: ["Pronóstico", "Alertas oficiales", "Entiende el clima", "Prevención"],
    titulo: "El clima cambia.<br><em>Prepárate.</em>",
    descricao: "Información meteorológica clara para entender las condiciones y encontrar orientación oficial confiable.",
    previsao: "¿Cómo está el tiempo en tu ciudad?",
    instrucao: "Busca una ciudad para consultar las condiciones actuales y el pronóstico.",
    campo: "Escribe una ciudad (ej.: Madrid)",
    botao: "Consultar"
  }
};

const seletorIdioma = document.getElementById("languageSelect");

function trocarIdioma() {
  const idioma = seletorIdioma.value;
  const t = textosIdiomas[idioma];

  document.documentElement.lang = idioma;

  document.querySelectorAll("#mainNav a").forEach((link, i) => {
    link.textContent = t.menu[i];
  });

  document.querySelector(".hero h1").innerHTML = t.titulo;
  document.querySelector(".hero-copy > p").textContent = t.descricao;
  document.querySelector(".weather-section h2").textContent = t.previsao;
  document.querySelector(".weather-section .section-heading p").textContent = t.instrucao;
  document.getElementById("cityInput").placeholder = t.campo;
  document.querySelector("#weatherForm button").textContent = t.botao;
}

if (seletorIdioma) {
  seletorIdioma.addEventListener("change", trocarIdioma);
  trocarIdioma();
}

/* TRADUCAO COMPLEMENTAR - CLIMA ALERTA GLOBAL */

const textosExtras = {
  pt: {
    topo: "INFORMAÇÃO CLIMÁTICA PARA O MUNDO TODO",
    idioma: "🌐 Idioma:",
    destaque: "CLIMA, INFORMAÇÃO E PREVENÇÃO",
    consultar: "Consultar previsão ",
    alertas: "Ver alertas oficiais",
    confianca: " Conteúdo informativo com links para fontes oficiais",
    arte: "PREPARAÇÃO COMEÇA COM INFORMAÇÃO",
    arteTexto: "Consulte fontes confiáveis e acompanhe as atualizações.",
    condicoes: "CONDIÇÕES DO TEMPO",
    dados: " DADOS METEOROLÓGICOS"
  },
  en: {
    topo: "WEATHER INFORMATION FOR THE WHOLE WORLD",
    idioma: "🌐 Language:",
    destaque: "WEATHER, INFORMATION AND SAFETY",
    consultar: "Check forecast ",
    alertas: "View official alerts",
    confianca: " Informational content with links to official sources",
    arte: "PREPAREDNESS STARTS WITH INFORMATION",
    arteTexto: "Check trusted sources and stay informed.",
    condicoes: "WEATHER CONDITIONS",
    dados: " WEATHER DATA"
  },
  es: {
    topo: "INFORMACIÓN METEOROLÓGICA PARA TODO EL MUNDO",
    idioma: "🌐 Idioma:",
    destaque: "CLIMA, INFORMACIÓN Y PREVENCIÓN",
    consultar: "Consultar pronóstico ",
    alertas: "Ver alertas oficiales",
    confianca: " Contenido informativo con enlaces a fuentes oficiales",
    arte: "LA PREPARACIÓN COMIENZA CON INFORMACIÓN",
    arteTexto: "Consulta fuentes confiables y mantente informado.",
    condicoes: "CONDICIONES METEOROLÓGICAS",
    dados: " DATOS METEOROLÓGICOS"
  }
};

function traduzirExtras() {
  const idioma = document.getElementById("languageSelect").value;
  const t = textosExtras[idioma];

  document.querySelector(".topline-inner span").textContent = t.topo;
  document.querySelector(".language-switcher label").textContent = t.idioma;
  document.querySelector(".hero-copy .eyebrow").lastChild.textContent = " " + t.destaque;
  document.querySelector(".hero-actions .btn-primary").firstChild.textContent = t.consultar;
  document.querySelector(".hero-actions .text-link").textContent = t.alertas;
  document.querySelector(".trust-note").lastChild.textContent = t.confianca;
  document.querySelector(".art-caption b").textContent = t.arte;
  document.querySelector(".art-caption span").textContent = t.arteTexto;
  document.querySelector(".weather-section .eyebrow").textContent = t.condicoes;
  document.querySelector(".live-label").lastChild.textContent = t.dados;

  const locais = { pt: "pt-BR", en: "en-US", es: "es-ES" };
  document.getElementById("today").textContent =
    new Date().toLocaleDateString(locais[idioma], {
      weekday: "long", day: "2-digit",
      month: "long", year: "numeric"
    });
}

const seletorExtras = document.getElementById("languageSelect");
if (seletorExtras) {
  seletorExtras.addEventListener("change", traduzirExtras);
  traduzirExtras();
}

/* TRADUCAO DOS ALERTAS - CLIMA ALERTA GLOBAL */

const traducoesAlertas = {
  pt: {
    etiqueta: "SEGURANÇA EM PRIMEIRO LUGAR",
    titulo: "Alertas e informações oficiais",
    descricao: "Consulte diretamente os órgãos responsáveis por emitir avisos e orientações.",
    cartoes: [
      ["PROTEÇÃO E DEFESA CIVIL", "Defesa Civil Nacional",
       "Orientações de prevenção e informações sobre situações de risco.",
       "Acessar fonte oficial"],
      ["AVISOS METEOROLÓGICOS", "Alertas do INMET",
       "Avisos de chuva intensa, tempestades, ventos e baixa umidade.",
       "Consultar alertas"],
      ["ORIENTAÇÃO AO CIDADÃO", "Orientações de segurança",
       "Saiba como agir antes, durante e depois de eventos extremos.",
       "Ver orientações"]
    ],
    destaque: "Importante:",
    aviso: "Este portal é informativo e não substitui os alertas oficiais. Em emergência, siga as instruções das autoridades locais."
  },
  en: {
    etiqueta: "SAFETY FIRST",
    titulo: "Official weather alerts and information",
    descricao: "Access official Brazilian weather and civil defense sources.",
    cartoes: [
      ["CIVIL DEFENSE - BRAZIL", "Brazilian Civil Defense",
       "Prevention guidance and information about hazardous situations.",
       "Visit official source"],
      ["WEATHER WARNINGS - BRAZIL", "INMET Weather Alerts",
       "Warnings for heavy rain, storms, strong winds and low humidity.",
       "View weather alerts"],
      ["SAFETY GUIDANCE - BRAZIL", "Safety Guidelines",
       "Learn how to prepare for and respond to extreme events.",
       "Read safety guidelines"]
    ],
    destaque: "Important:",
    aviso: "This website is informational and does not replace official warnings. In an emergency, follow your local authorities."
  },
  es: {
    etiqueta: "LA SEGURIDAD ES LO PRIMERO",
    titulo: "Alertas e información meteorológica oficial",
    descricao: "Consulta fuentes meteorológicas y de protección civil de Brasil.",
    cartoes: [
      ["PROTECCIÓN CIVIL - BRASIL", "Defensa Civil de Brasil",
       "Consejos de prevención e información sobre situaciones de riesgo.",
       "Visitar fuente oficial"],
      ["AVISOS METEOROLÓGICOS - BRASIL", "Alertas del INMET",
       "Avisos de lluvias intensas, tormentas, vientos y baja humedad.",
       "Consultar alertas"],
      ["ORIENTACIÓN DE SEGURIDAD - BRASIL", "Consejos de seguridad",
       "Aprende cómo actuar antes, durante y después de eventos extremos.",
       "Ver recomendaciones"]
    ],
    destaque: "Importante:",
    aviso: "Este sitio es informativo y no sustituye las alertas oficiales. En caso de emergencia, sigue las indicaciones de las autoridades locales."
  }
};

function traduzirAlertas() {
  const seletor = document.getElementById("languageSelect");
  const secao = document.getElementById("alertas");
  if (!seletor || !secao) return;

  const t = traducoesAlertas[seletor.value] || traducoesAlertas.pt;

  secao.querySelector(".section-heading .eyebrow").textContent = t.etiqueta;
  secao.querySelector(".section-heading h2").textContent = t.titulo;
  secao.querySelector(".section-heading p").textContent = t.descricao;

  secao.querySelectorAll(".alert-card").forEach((cartao, i) => {
    const dados = t.cartoes[i];
    if (!dados) return;
    cartao.querySelector(".card-kicker").textContent = dados[0];
    cartao.querySelector("b").textContent = dados[1];
    cartao.querySelector("p").textContent = dados[2];
    cartao.querySelector(".card-link").textContent = dados[3] + " ↗";
  });

  const aviso = secao.querySelector(".important-note");
  aviso.querySelector("b").textContent = t.destaque;
  aviso.lastChild.textContent = " " + t.aviso;
}

document.getElementById("languageSelect")
  ?.addEventListener("change", traduzirAlertas);

traduzirAlertas();


/* TRADUCAO - ENTENDA O CLIMA */

const textosClima = {
  pt: {
    etiqueta: "ENTENDA OS FENÔMENOS",
    titulo: "O que acontece com o clima?",
    descricao: "Explicações diretas sobre fenômenos naturais e seus possíveis efeitos.",
    botao: "Acompanhar o CPTEC/INPE ↗",
    temas: [
      ["El Niño e La Niña", "Entenda como o aquecimento e o resfriamento do Pacífico podem influenciar a chuva e a temperatura."],
      ["Ondas de calor", "Saiba reconhecer períodos de calor intenso e como reduzir riscos."],
      ["Chuvas intensas", "Conheça cuidados para temporais, alagamentos e enxurradas."]
    ]
  },
  en: {
    etiqueta: "UNDERSTAND WEATHER PHENOMENA",
    titulo: "What's happening with the climate?",
    descricao: "Clear explanations of natural phenomena and their possible effects.",
    botao: "Visit CPTEC/INPE (Brazil) ↗",
    temas: [
      ["El Niño and La Niña", "Learn how warming and cooling in the Pacific can influence rainfall and temperatures."],
      ["Heat waves", "Learn how to recognize extreme heat and reduce risks."],
      ["Heavy rainfall", "Learn safety precautions for storms and flooding."]
    ]
  },
  es: {
    etiqueta: "COMPRENDE LOS FENÓMENOS",
    titulo: "¿Qué está pasando con el clima?",
    descricao: "Explicaciones claras sobre los fenómenos naturales y sus posibles efectos.",
    botao: "Visitar CPTEC/INPE (Brasil) ↗",
    temas: [
      ["El Niño y La Niña", "Descubre cómo el calentamiento y enfriamiento del Pacífico pueden influir en las lluvias y temperaturas."],
      ["Olas de calor", "Aprende a reconocer el calor extremo y reducir riesgos."],
      ["Lluvias intensas", "Conoce las precauciones ante tormentas e inundaciones."]
    ]
  }
};

function traduzirClima() {
  const seletor = document.getElementById("languageSelect");
  const secao = document.getElementById("entenda");
  if (!seletor || !secao) return;

  const t = textosClima[seletor.value] || textosClima.pt;
  const intro = secao.querySelector(".learn-grid > div:first-child");
  if (!intro) return;

  intro.querySelector(".eyebrow").textContent = t.etiqueta;
  intro.querySelector("h2").textContent = t.titulo;
  intro.querySelector("p").textContent = t.descricao;
  intro.querySelector(".btn-dark").textContent = t.botao;

  secao.querySelectorAll(".topic-list a").forEach((item, i) => {
    if (!t.temas[i]) return;
    item.querySelector("b").textContent = t.temas[i][0];
    item.querySelector("small").textContent = t.temas[i][1];
  });
}

const seletorClima = document.getElementById("languageSelect");
if (seletorClima) {
  seletorClima.addEventListener("change", traduzirClima);
  traduzirClima();
}

/* TRADUCAO - PREVENCAO */

const textosPrevencao = {
  pt: {
    etiqueta: "INFORMAÇÃO QUE PROTEGE",
    titulo: "Pequenas atitudes fazem diferença",
    descricao: "Alguns cuidados simples ajudam a reduzir riscos em períodos de tempo severo.",
    dicas: [
      ["Cuide da sua casa", "Mantenha calhas limpas e não deixe lixo obstruir bueiros e ralos."],
      ["Acompanhe os avisos", "Consulte os alertas oficiais da sua região."],
      ["Durante tempestades", "Evite áreas alagadas e não se abrigue debaixo de árvores."],
      ["Em períodos de calor", "Beba água, procure sombra e evite esforço físico nos horários mais quentes."]
    ]
  },
  en: {
    etiqueta: "INFORMATION THAT PROTECTS",
    titulo: "Small actions make a difference",
    descricao: "Simple precautions can help reduce risks during severe weather.",
    dicas: [
      ["Protect your home", "Keep gutters clean and drains free of debris."],
      ["Follow official alerts", "Check official weather warnings for your area."],
      ["During storms", "Avoid flooded areas and never shelter under trees."],
      ["During hot weather", "Drink water, seek shade and avoid strenuous activity during the hottest hours."]
    ]
  },
  es: {
    etiqueta: "INFORMACIÓN QUE PROTEGE",
    titulo: "Pequeñas acciones marcan la diferencia",
    descricao: "Algunas precauciones ayudan a reducir riesgos durante condiciones meteorológicas extremas.",
    dicas: [
      ["Cuida tu hogar", "Mantén las canaletas limpias y los desagües libres de basura."],
      ["Consulta las alertas", "Revisa los avisos meteorológicos oficiales de tu región."],
      ["Durante las tormentas", "Evita las zonas inundadas y no te refugies debajo de árboles."],
      ["Durante el calor", "Bebe agua, busca sombra y evita el esfuerzo físico durante las horas más calurosas."]
    ]
  }
};

function traduzirPrevencao() {
  const seletor = document.getElementById("languageSelect");
  const secao = document.getElementById("prevencao");
  if (!seletor || !secao) return;

  const t = textosPrevencao[seletor.value] || textosPrevencao.pt;
  const cabecalho = secao.querySelector(".section-heading");

  if (cabecalho) {
    cabecalho.querySelector(".eyebrow").textContent = t.etiqueta;
    cabecalho.querySelector("h2").textContent = t.titulo;
    cabecalho.querySelector("p").textContent = t.descricao;
  }

  secao.querySelectorAll(".tips-grid .tip").forEach((cartao, i) => {
    if (!t.dicas[i]) return;
    cartao.querySelector("b").textContent = t.dicas[i][0];
    cartao.querySelector("p").textContent = t.dicas[i][1];
  });
}

const seletorPrevencao = document.getElementById("languageSelect");

if (seletorPrevencao) {
  seletorPrevencao.addEventListener("change", traduzirPrevencao);
  traduzirPrevencao();
}
