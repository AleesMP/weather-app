// Navbar
// Light/Dark switch
const themeToggleButton = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

themeToggleButton.addEventListener("click", () => {
  const htmlClasses = document.documentElement.classList;
  if (htmlClasses.contains("dark")) {
    htmlClasses.remove("dark");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  } else {
    htmlClasses.add("dark");
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Configuración inicial de botones y forecast
  const buttons = document.querySelectorAll(".forecast-buttons button");

  function setActiveButton(index) {
    buttons.forEach((btn) => btn.classList.remove("active"));
    buttons[index].classList.add("active");
  }

  function updateButtonsAndForecast(days, index) {
    setActiveButton(index);
    updateForecast(days, weatherData);
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const days = index === 0 ? 3 : 5;
      updateButtonsAndForecast(days, index);
    });
  });

  // Inicialización inicial
  resetButtons();
  // updateForecast(3, weatherData);

  // Función para resetear los botones "3/5 days" a su estado inicial
  function resetButtons() {
    buttons.forEach((btn) => btn.classList.remove("active"));
    buttons[0].classList.add("active");
  }
});

  // Main
  const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
  const apiKey = "eb09705f59f13d948efa3f16fa466a92";

  const searchBox = document.querySelector(".search input");
  const searchBtn = document.querySelector(".search button");
  const weatherIcon = document.querySelector("#weather-icon");
  let weatherData; // Variable global para almacenar los datos del clima
  let hourlyChart; // Variable para almacenar la instancia del gráfico

  // Función para obtener y mostrar el resumen del clima
  async function updateSummary(city) {
    try {
      const summaryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      const response = await fetch(summaryUrl);
      const data = await response.json();

      if (response.status !== 200) {
        console.error("Error al obtener el resumen del clima:", data.message);
        return;
      }

      // Llamar a la función para actualizar el gráfico por horas
      await updateHourlyChart(data.coord.lat, data.coord.lon);
    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  }

  // Función para actualizar el gráfico por horas
  async function updateHourlyChart(lat, lon) {
    try {
      const hourlyUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await fetch(hourlyUrl);
      const data = await response.json();

      if (response.status !== 200) {
        console.error("Error al obtener los datos por horas:", data.message);
        return;
      }

      const hourlyData = data.list.slice(0, 24); // Obtener las primeras 24 entradas
      const labels = hourlyData.map((hour) =>
        new Date(hour.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      const temperatures = hourlyData.map((hour) => hour.main.temp);
      const weatherDescriptions = hourlyData.map(
        (hour) => hour.weather[0].description
      );

      // Destruir el gráfico existente si ya existe
      if (hourlyChart) {
        hourlyChart.destroy();
      }

      const ctx = document.getElementById("hourlyChart").getContext("2d");
      hourlyChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperatura (°C)",
              data: temperatures,
              borderColor: "rgb(34, 132, 252)",
              backgroundColor: "rgba(75, 149, 192, 0.2)",
              fill: true,
              yAxisID: "y",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                title: function (tooltipItems) {
                  return tooltipItems[0].label;
                },
                label: function (tooltipItem) {
                  const temperature = `Temperatura: ${tooltipItem.raw}°C`;
                  const description = `Descripción: ${
                    weatherDescriptions[tooltipItem.dataIndex]
                  }`;
                  return [temperature, description].filter(Boolean);
                },
              },
            },
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Clima por Horas",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Hora",
              },
            },
            y: {
              title: {
                display: true,
                text: "Temperatura (°C)",
              },
              position: "left",
            },
          },
        },
      });

      // Ajustar el tamaño del gráfico dinámicamente
      window.addEventListener("resize", () => {
        hourlyChart.resize();
      });
      
      // Redimensiona el mapa para que cargue entero
      map.invalidateSize();

    } catch (error) {
      console.error("Error fetching hourly data:", error);
    }
  }

  // Función para obtener datos del clima por ciudad
  async function checkWeather(city) {

    // Mensaje por defecto
    const defaultMessage = document.querySelector(".default-message");
    if (!city) {
      defaultMessage.style.display = "block";
      document.querySelector(".weather").style.display = "none";
      document.querySelector(".city-map").style.display = "none";
      document.querySelector(".history-container").style.display = "none";
      document.querySelector(".forecast").style.display = "none";
      document.querySelector(".summary").style.display = "none";
      document.querySelector(".error").style.display = "none";
      return;
    }

    try {
      const response = await fetch(
        apiUrl + city + `&appid=${apiKey}&units=metric`
      );
      const data = await response.json();

      if (response.status === 404) {
        defaultMessage.style.display = "none";
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".city-map").style.display = "none";
        document.querySelector(".history-container").style.display = "none";
        document.querySelector(".forecast").style.display = "none";
        document.querySelector(".summary").style.display = "none";
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
      document.querySelector(".wind").innerHTML = `${data.wind.speed} km/h`;
      document.querySelector(".pressure").innerHTML = `${data.main.pressure} hPa`;

      // Funcion para obtener hora y dia
      function getCurrentTimeAndDay(timezoneOffset) {
        const now = new Date();
        const localOffset = now.getTimezoneOffset() * 60000;
        const localTime = new Date(now.getTime() + localOffset + timezoneOffset * 1000);
        let hours = localTime.getHours();
        const minutes = localTime.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
        const dayOfWeek = daysOfWeek[localTime.getDay()];
        const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
        return { dayOfWeek, formattedTime };
      }

      const { dayOfWeek, formattedTime } = getCurrentTimeAndDay(data.timezone);
      const h2Hour = document.getElementById("time");
      h2Hour.textContent = `${dayOfWeek}, ${formattedTime}`;

      // Añade datos de lluvia si llueve
      const rainContainer = document.querySelector(".rain-container");
      if (data.rain && data.rain["1h"]) {
        rainContainer.innerHTML = `<i class="fa-solid fa-droplet fa-lg"></i><p class="ml-1">${data.rain["1h"]}mm/h</p>`;
      } else {
        rainContainer.innerHTML = "";
      }

      // Actualizar el mapa
      updateMap(data);

      // Mostrar el contenido al encontrar una ciudad correcta
      document.querySelector(".weather").style.display = "block";
      document.querySelector(".city-map").style.display = "block";
      document.querySelector(".history-container").style.display = "block";
      document.querySelector(".forecast").style.display = "block";
      document.querySelector(".summary").style.display = "block";
      document.querySelector(".error").style.display = "none";
      defaultMessage.style.display = "none";

      updateWeatherIcon(data);

      // Resetear los botones y actualizar la prevision inicial para 3 dias por defecto
      resetButtons();
      updateForecast(3, data);

      // Llamar a la función para actualizar el resumen
      updateSummary(city);
      
      // Para que muestre el mapa cargado correctamente
      map.invalidateSize();

      // Llamada a alertas meterologicas
      showWeatherAlerts(data.name, data.sys.country);

    } catch (error) {
      console.error("Error fetching weather data:", error);
      document.querySelector(".weather").style.display = "none";
      document.querySelector(".city-map").style.display = "none";
      document.querySelector(".history-container").style.display = "none";
      document.querySelector(".forecast").style.display = "none";
      document.querySelector(".summary").style.display = "none";
      document.querySelector(".error").style.display = "block";
      defaultMessage.style.display = "none";
      weatherIcon.src = "/assets/svg/default.svg";
    }
  }

  // Mapa
  // Inicializar el mapa de Leaflet
  const map = L.map("map").setView([0, 0], 8); // Coordenadas iniciales y nivel de zoom

  // Añadir la capa base de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  }).addTo(map);

  // Capa de precipitaciones de OpenWeatherMap
  const precipitationLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`,
    {
      attribution: "Map data © OpenWeatherMap",
      maxZoom: 18,
    }
  );

  // Función para actualizar el mapa con la capa de OpenWeatherMap
  function updateMap(data) {
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    map.setView([lat, lon], 7); // Centrar el mapa en las coordenadas de la ciudad

    // Añadir la capa de precipitaciones
    precipitationLayer.addTo(map);
  }

  // Funcion para obtener la prevision por coordenadas
  async function getForecast(latitude, longitude) {
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
      // ? console.log(forecastData);

      return forecastData; // Devolver los datos de la prevision del tiempo
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      return null; // Manejar el error y devolver null en caso de error
    }
  }

  // Forecast ------
  // Funcion para actualizar getForecast
  async function updateForecast(numDays, weatherData) {
    try {
      const forecastData = await getForecast(
        weatherData.coord.lat,
        weatherData.coord.lon,
        numDays * 8
      );

      if (forecastData) {
        const forecastContainer = document.querySelector(".forecast-container");
        forecastContainer.innerHTML = "";

        const dailyForecasts = {};
        forecastData.list.forEach((item) => {
          const dateTime = new Date(item.dt_txt);
          const hour = dateTime.getUTCHours();

          if (hour >= 10 && hour <= 13) {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyForecasts[date]) {
              dailyForecasts[date] = {
                temp_max: -Infinity,
                temp_min: Infinity,
                weather: item.weather[0],
                description: item.weather[0].description,
                dt_txt: item.dt_txt,
              };
            }

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

        const dates = Object.keys(dailyForecasts).slice(0, numDays);

        dates.forEach((date) => {
          const forecast = dailyForecasts[date];
          const forecastItem = document.createElement("div");
          forecastItem.classList.add(
            "flex",
            "items-center",
            "justify-between",
            "space-x-4",
            "p-2",
            "bg-white",
            "bg-opacity-50",
            "rounded-lg"
          );

          const dateTimeString = forecast.dt_txt;
          const dateTime = new Date(dateTimeString);
          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayOfWeek = daysOfWeek[dateTime.getDay()];
          const formattedDate = `${dateTime.getDate()} ${getMonthName(
            dateTime.getMonth()
          )}, ${dayOfWeek}`;

          const tempMax = Math.round(forecast.temp_max);
          const tempMin = Math.round(forecast.temp_min);

          const iconCode = forecast.weather.icon;
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

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

        // Ajuste para asegurar que el contenedor tenga al menos una altura mínima
        forecastContainer.style.minHeight = `${forecastContainer.clientHeight}px`;
      }
    } catch (error) {
      console.error("Error updating forecast:", error);
    }
  }

  // Obtener el nombre del mes
  function getMonthName(monthIndex) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex];
  }

// Función para obtener alertas meteorológicas
async function getWeatherAlerts(city, countryCode) {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const alertUrl = `https://history.openweathermap.org/data/2.5/history/city?q=${city},${countryCode}&type=hour&start=${currentTimestamp - 3600}&end=${currentTimestamp}&appid=${apiKey}`;

    const response = await fetch(alertUrl);
    const data = await response.json();

    if (response.status !== 200) {
      console.error("Error al obtener alertas meteorológicas:", data.message);
      return null;
    }

    return data.alerts || []; // Devolver las alertas encontradas
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    return null;
  }
}

// Función para mostrar alertas meteorológicas
async function showWeatherAlerts(city, countryCode) {
  const alertContainer = document.querySelector(".history-container");
  alertContainer.innerHTML = ""; // Limpiar contenido actual

  const alerts = await getWeatherAlerts(city, countryCode);

  if (alerts && alerts.length > 0) {
    alerts.forEach((alert) => {
      const alertItem = document.createElement("div");
      alertItem.classList.add(
        "flex",
        "items-center",
        "justify-between",
        "space-x-4",
        "p-2",
        "bg-white",
        "bg-opacity-50",
        "rounded-lg"
      );

      const alertDate = new Date(alert.start * 1000);
      const alertDateString = alertDate.toLocaleString();

      alertItem.innerHTML = `
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-exclamation-triangle fa-lg text-yellow-500"></i>
          <div class="text-lg font-semibold">${alert.event}</div>
          <div class="text-sm text-center w-64">${alert.description}</div>
        </div>
        <div class="text-right text-sm">${alertDateString}</div>
      `;

      alertContainer.appendChild(alertItem);
    });

    // Mostrar el contenedor de alertas
    alertContainer.style.display = "block";
  } else {
    // Mostrar mensaje de ninguna alerta encontrada
    alertContainer.innerHTML = `<div class="text-xl font-bold">No hay alertas meteorológicas para esta ciudad.</div>`;
    alertContainer.style.display = "block";
  }
}

  // Funcion para resetear los botones "3/5 days" a su estado inicial
  function resetButtons() {
    const buttons = document.querySelectorAll(".forecast-buttons button");
    buttons.forEach((btn) => btn.classList.remove("active"));
    buttons[0].classList.add("active");
  }

  // Eventos de los botones "3/5 days"
  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".forecast-buttons button");
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const days = index === 0 ? 3 : 5;
        updateForecast(days, weatherData);
      });
    });
  });

  document.querySelector(".forecast-buttons button:nth-child(1)").addEventListener("click", () => updateForecast(3, weatherData));
  document.querySelector(".forecast-buttons button:nth-child(2)").addEventListener("click", () => updateForecast(5, weatherData));

  // Evento de búsqueda
  searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
    updateSummary(searchBox.value);
  });

  document.querySelector(".search input").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        checkWeather(searchBox.value);
        updateSummary(searchBox.value);
      }
    });