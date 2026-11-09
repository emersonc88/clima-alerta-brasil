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
