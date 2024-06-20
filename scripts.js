// Navbar
// Light/Dark switch
const themeToggleButton = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    themeToggleButton.addEventListener('click', () => {
      const htmlClasses = document.documentElement.classList;
      if (htmlClasses.contains('dark')) {
        htmlClasses.remove('dark');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      } else {
        htmlClasses.add('dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    });

// Main
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey = "eb09705f59f13d948efa3f16fa466a92";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector("#weather-icon");
const forecastContainer = document.querySelector(".forecast-container");
let weatherData; // Variable global para almacenar los datos del clima

// Función para obtener datos del clima por ciudad
async function checkWeather(city) {
  try {
    const response = await fetch(
      apiUrl + city + `&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    if (response.status === 404) {
      document.querySelector(".weather").style.display = "none";
      document.querySelector(".error").style.display = "block";
      return;
    }

    // Actualizar weatherData con los datos obtenidos
    weatherData = data;

    // Icono del tiempo actual
    function updateWeatherIcon(data) {
      let iconCode = data.weather[0].icon;
      weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    // Obtener datos
    document.querySelector(".city").innerHTML = `${data.name}, ${data.sys.country}`;
    document.querySelector(".description").innerHTML =data.weather[0].description;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp);
    document.querySelector(".humidity").innerHTML = `${data.main.humidity}%`;
    document.querySelector(".wind").innerHTML = `${data.wind.speed}km/h`;

    // Funcion para obtener hora y dia
    function getCurrentTimeAndDay(timezoneOffset) {
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60000;
      const localTime = new Date(
        now.getTime() + localOffset + timezoneOffset * 1000
      );
      let hours = localTime.getHours();
      const minutes = localTime.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayOfWeek = daysOfWeek[localTime.getDay()];
      const formattedTime = `${hours}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
      return {
        dayOfWeek,
        formattedTime,
      };
    }

    const { dayOfWeek, formattedTime } = getCurrentTimeAndDay(data.timezone);
    const h2Hour = document.getElementById("time");
    h2Hour.textContent = `${dayOfWeek}, ${formattedTime}`;

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";

    updateWeatherIcon(data);

    // Actualizar la prevision inicial para 3 dias por defecto
    updateForecast(3, data);

    // Añadir eventos a los botones
    document
      .querySelector(".forecast-buttons button:nth-child(1)")
      .addEventListener("click", () => updateForecast(3, data));
    document
      .querySelector(".forecast-buttons button:nth-child(2)")
      .addEventListener("click", () => updateForecast(5, data));

    // Mapa
    const mapIframe = document.getElementById("map-iframe");
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    mapIframe.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=5&level=surface&overlay=rain&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
    
    const hideElements = () => {
      const iframeDocument = mapIframe.contentDocument || mapIframe.contentWindow.document;
      const cookieBanner = iframeDocument.querySelector(".cookie-banner"); // Ajusta el selector según sea necesario
      const header = iframeDocument.querySelector(".openweathermap-header"); // Ajusta el selector según sea necesario
      if (cookieBanner) cookieBanner.style.display = 'none';
      if (header) header.style.display = 'none';
    };

     // Intentar ocultar los elementos no deseados repetidamente por unos segundos
     let attempts = 0;
     const maxAttempts = 10;
     const intervalId = setInterval(() => {
       hideElements();
       attempts += 1;
       if (attempts >= maxAttempts) clearInterval(intervalId);
     }, 500);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error").style.display = "block";
    weatherIcon.src = "/assets/svg/default.svg";
  }
}

// Funcion para obtener la prevision por coordenadas
async function getForecastByCoordinates(latitude, longitude) {
  try {
    const apiUrl = "https://api.openweathermap.org/data/2.5/forecast";
    const apiKey = "eb09705f59f13d948efa3f16fa466a92";
    const forecastResponse = await fetch(`${apiUrl}?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`); // Realizar la solicitud para obtener la prevision del tiempo
    const forecastData = await forecastResponse.json();

    if (forecastResponse.status === 404) {
      console.error("Forecast data not available");
      return null;
    }

    // Log para verificar los datos
    console.log(forecastData);

    return forecastData; // Devolver los datos de la prevision del tiempo
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null; // Manejar el error y devolver null en caso de error
  }
}

// Forecast ------
// Funcion para actualizar getForecastByCoordinates
async function updateForecast(numDays, weatherData) {
  try {
    const forecastData = await getForecastByCoordinates(
      weatherData.coord.lat,
      weatherData.coord.lon,
      numDays * 8
    ); // Aproximadamente 8 registros por día (cada 3 horas)

    if (forecastData) {
      // Limpiar el contenedor de pronóstico antes de actualizar
      const forecastContainer = document.querySelector(".forecast-container");
      forecastContainer.innerHTML = "";

      // Filtrar y agrupar los datos por día cerca de las 12 del mediodía
      const dailyForecasts = {};
      forecastData.list.forEach((item) => {
        const dateTime = new Date(item.dt_txt);
        const hour = dateTime.getUTCHours();

        // Asegurarse de seleccionar los datos cerca de las 12 del mediodía
        if (hour >= 10 && hour <= 13) {
          // Ajustar según la ventana horaria deseada (10:00 - 13:00)
          const date = item.dt_txt.split(" ")[0]; // Obtener solo la fecha (YYYY-MM-DD)
          if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
              temp_max: -Infinity,
              temp_min: Infinity,
              weather: item.weather[0],
              description: item.weather[0].description,
              dt_txt: item.dt_txt,
            };
          }

          // Actualizar las temperaturas máxima y mínima para el día
          dailyForecasts[date].temp_max = Math.max(
            dailyForecasts[date].temp_max,
            item.main.temp_max
          );
          dailyForecasts[date].temp_min = Math.min(
            dailyForecasts[date].temp_min,
            item.main.temp_min
          );
        }
      });

      // Obtener las claves (fechas) y limitarlas a 'numDays'
      const dates = Object.keys(dailyForecasts).slice(0, numDays);

      // Iterar sobre las fechas seleccionadas y mostrar la prevision
      dates.forEach((date) => {
        const forecast = dailyForecasts[date];

        // Crear elemento de pronóstico con clases de Tailwind
        const forecastItem = document.createElement("div");
        forecastItem.classList.add(
          "flex", "items-center", "justify-between", "space-x-4", "p-2", "bg-white", "bg-opacity-50", "rounded-lg"
        );

        // Obtener la fecha y hora del texto
        const dateTimeString = forecast.dt_txt;
        const dateTime = new Date(dateTimeString);

        // Obtener el nombre del día de la semana abreviado a 3 letras
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOfWeek = daysOfWeek[dateTime.getDay()];

        // Formatear la fecha como "Número del Día Mes, Día de la semana"
        const formattedDate = `${dateTime.getDate()} ${getMonthName(
          dateTime.getMonth()
        )}, ${dayOfWeek}`;

        // Obtener temp_max y temp_min redondeados al siguiente entero
        const tempMax = Math.round(forecast.temp_max);
        const tempMin = Math.round(forecast.temp_min);

        // Obtener el código del icono y crear la URL del icono
        const iconCode = forecast.weather.icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // Añadir la imagen del icono a la previsión
        forecastItem.innerHTML = `
          <div class="flex items-center space-x-2">
            <img src="${iconUrl}" alt="Weather icon" class="w-8 h-8">
            <div class="text-lg font-semibold">${tempMax}º / ${tempMin}º</div>
            <div class="text-sm text-center w-32">${forecast.description}</div>
          </div>
          <div class="text-right text-sm">${formattedDate}</div>
        `;

        forecastContainer.appendChild(forecastItem);
      });

      // Función para obtener el nombre del mes a partir de su número
      function getMonthName(monthIndex) {
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        return months[monthIndex];
      }
    } else {
      console.error("No forecast data available");
    }
  } catch (error) {
    console.error("Error updating forecast:", error);
  }
}

// Funcion para que el boton de "3 days" esté activo por defecto
document.querySelector('.forecast-buttons').addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    // Remover clase activa de todos los botones
    document.querySelectorAll('.forecast-buttons button').forEach(button => {
      button.classList.remove('active');
    });

    // Añadir clase activa al botón clicado
    event.target.classList.add('active');

    // Determinar el número de días según el botón clicado
    const numDays = event.target.textContent === '3 days' ? 3 : 5;
    
    // Llamar a updateForecast con el número de días y weatherData definido en otro contexto
    updateForecast(numDays, weatherData); // Asegúrate de que weatherData esté definido y accesible aquí
  }
});

// Evento para buscar la ciudad
// boton buscar
searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});

// tecla "Enter"
searchBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkWeather(searchBox.value);
  }
});

