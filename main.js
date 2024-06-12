const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey = "eb09705f59f13d948efa3f16fa466a92";

const searchBox = document.querySelector(".search input")
const searchBtn = document.querySelector(".search button")

async function checkWeather(city) {
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
  var data = await response.json();

  console.log(data);

  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "ºC";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".city").innerHTML = data.name;
}

searchBtn.addEventListener("click", ()=>{
    checkWeather(searchBox.value);
})



checkWeather();








// Sidebar
var navList = document.getElementById("nav-list");
var items = navList.getElementsByClassName("nav-item");

for (var i=0; i<items.length; i++) {
    items[i].addEventListener("click", function(){
        var current = document.querySelectorAll('.active');
        current.forEach((element) => {
            element.classList.remove("active");
        });

        this.classList.add('active');
    })
}

// // Funcion tiempo
// $(document).ready(function () {
//   weatherFn("Valencia");
// });

// async function weatherFn(cName) {
//   const temp = `${apiUrl}?q=${cName}&appid=${apiKey}&units=metric`;
//   try {
//     const res = await fetch(temp);
//     const data = await res.json();
//     if (res.ok) {
//       weatherShowFn(data);
//     } else {
//       alert("Ciudad no encontrada. Por favor, introduce una ciudad existente");
//     }
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//   }
// }

// function weatherShowFn(data) {
//   $("#city-name").text(data.name);
//   $("#date").text(moment().format("MMMM Do YYYY, h:mm:ss a"));
//   $("#temperature").html(`${data.main.temp}°C`);
//   $("#description").text(data.weather[0].description);
//   $("#wind-speed").html(`Wind Speed: ${data.wind.speed} m/s`);
//   $("#weather-icon").attr("src", `...`);
//   $("#weather-info").fadeIn();
// }
