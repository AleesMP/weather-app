const url = "https://api.openweathermap.org/data/2.5/weather";
const apiKey = "eb09705f59f13d948efa3f16fa466a92";

// Funcion tiempo
// $(document).ready(function () {
//   weatherFn("Pune");
// });

// async function weatherFn(cName) {
//   const temp = `${url}?q=${cName}&appid=${apiKey}&units=metric`;
//   try {
//     const res = await fetch(temp);
//     const data = await res.json();
//     if (res.ok) {
//       weatherShowFn(data);
//     } else {
//       alert("City not found. Please try again.");
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

// Navlist
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
