// Main
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey = "eb09705f59f13d948efa3f16fa466a92";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector("#weather-icon");
const forecastContainer = document.querySelector(".forecast-container")

async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}&units=metric`);
    const data = await response.json();

    if (response.status === 404) {
      document.querySelector(".weather").style.display = "none";
      document.querySelector(".error").style.display = "block";
      return;
    }

    // Icono del tiempo actual
    function updateWeatherIcon(data) {
      let iconCode = data.weather[0].icon;
      weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    // Obtener datos
    document.querySelector(".city").innerHTML = `${data.name}, ${data.sys.country}`;
    document.querySelector(".description").innerHTML = data.weather[0].description;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp);
    document.querySelector(".humidity").innerHTML = `${data.main.humidity}%`;
    document.querySelector(".wind").innerHTML = `${data.wind.speed}km/h`;

    // Añade datos de lluvia si llueve
    const rainContainer = document.querySelector(".rain-container");
    if (data.rain && data.rain['1h']) {
      rainContainer.innerHTML = `<i class="fa-solid fa-droplet"></i><p class="ml-1">${data.rain['1h']}mm/h</p>`;
    } else {
      rainContainer.innerHTML = '';
    }

    // Funcion para obtener hora y dia
    function getCurrentTimeAndDay(timezoneOffset) {
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60000;
      const localTime = new Date(now.getTime() + localOffset + (timezoneOffset * 1000));
      let hours = localTime.getHours();
      const minutes = localTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = daysOfWeek[localTime.getDay()];
      const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      return {
        dayOfWeek,
        formattedTime,
      };
    }

    const { dayOfWeek, formattedTime } = getCurrentTimeAndDay(data.timezone);
    const h2Hour = document.getElementById('time');
    h2Hour.textContent = `${dayOfWeek}, ${formattedTime}`;

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";

    updateWeatherIcon(data);

    // Actualizar la prevision inicial para 3 días por defecto
    updateForecast(3, data);

    // Añadir eventos a los botones
    document.querySelector(".forecast-buttons button:nth-child(1)").addEventListener('click', () => updateForecast(3, data));
    document.querySelector(".forecast-buttons button:nth-child(2)").addEventListener('click', () => updateForecast(5, data));

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

    // Realizar la solicitud para obtener la previsión del tiempo
    const forecastResponse = await fetch(`${apiUrl}?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();

    if (forecastResponse.status === 404) {
      console.error("Forecast data not available");
      return null;
    }

    // Log para verificar los datos
    console.log(forecastData);

    return forecastData; // Devolver los datos de la previsión del tiempo

  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null; // Manejar el error y devolver null en caso de error
  }
}

// Funcion para actualizar getForecastByCoordinates
async function updateForecast(numDays, weatherData) {
  try {
    const forecastData = await getForecastByCoordinates(weatherData.coord.lat, weatherData.coord.lon, numDays * 8); // Aproximadamente 8 registros por día (cada 3 horas)

    if (forecastData) {
      // Limpiar el contenedor de previsión antes de actualizar
      const forecastContainer = document.querySelector('.forecast-container');
      forecastContainer.innerHTML = '';

      // Agrupar los datos por día
      const dailyForecasts = {};
      forecastData.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; // Obtener solo la fecha (YYYY-MM-DD)
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = item;
        }
      });

      // Obtener las claves (fechas) y limitarlas a 'numDays'
      const dates = Object.keys(dailyForecasts).slice(0, numDays);

      // Iterar sobre las fechas seleccionadas y mostrar la previsión
      dates.forEach(date => {
        const forecast = dailyForecasts[date];
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
          <div>${forecast.dt_txt}</div>
          <div>${forecast.main.temp}°C</div>
          <div>${forecast.weather[0].description}</div>
        `;
        forecastContainer.appendChild(forecastItem);
      });
    } else {
      console.error("No forecast data available");
    }
  } catch (error) {
    console.error("Error updating forecast:", error);
  }
}

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
