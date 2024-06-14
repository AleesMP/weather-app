// Sidebar
var navList = document.getElementById("nav-list");
var items = navList.getElementsByClassName("nav-item");

for (var i = 0; i < items.length; i++) {
  items[i].addEventListener("click", function () {
    console.log("Clicked item:", this); // Añadir log para depuración

    var current = document.querySelectorAll(".active");
    current.forEach((element) => {
      element.classList.remove("active");
      console.log("Removed active class from:", element); // Añadir log para depuración
    });

    this.classList.add("active");
    console.log("Added active class to:", this); // Añadir log para depuración
  });
}

// Main 
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey = "eb09705f59f13d948efa3f16fa466a92";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector("#weather-icon");

async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    const data = await response.json();

    if (response.status === 404) {
      document.querySelector(".weather").style.display = "none";
      document.querySelector(".error").style.display = "block";
      return;
    }

    console.log(data);

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "ºC";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    function updateWeatherIcon(data) {
      let iconCode = data.weather[0].icon;
      weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    updateWeatherIcon(data);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";

  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error").style.display = "block";
    weatherIcon.src = "/assets/svg/default.svg";
  }
}

searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});