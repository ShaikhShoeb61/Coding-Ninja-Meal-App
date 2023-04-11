// selecting elements from the DOM
const search = document.querySelector("#search");
const foodList = document.querySelector(".food-list");
const favoriteList = document.querySelector(".favorite-meal");

// setting up the API url
let url = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

// defining a function to add search results to the DOM
const addItemToDom = async () => {
  try {
    // fetching data from the API
    const response = await fetch(`${url}${search.value}`);
    const { meals } = await response.json();
    
    // retrieving favorites from local storage
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (meals) {
      // filtering search results based on user input
      const searchItem = meals.filter((meal) =>
        meal.strMeal.toLowerCase().includes(search.value.toLowerCase())
      );
      
      // clearing previous search results from the DOM
      foodList.innerHTML = "";

      // creating a DOM element for each search result
      searchItem.forEach((meal) => {
        const { strMeal, strMealThumb, strArea } = meal;
        const isFavorite = favorites.some((f) => f.name === strMeal);
        const item = document.createElement("div");
        item.className = "items";
        item.innerHTML = `
          <img src="${strMealThumb}" id="foodImg">
          <div class="food-text">
            <label id="text">${strMeal}</label>
            <img src="${
              isFavorite ? "/Assets/Fav-icon-fill.svg" : "/Assets/Fav-icon.svg"
            }" id="favicon">
          </div>
          <label id="des">${strArea}</label>
        `;
        item.dataset.mealId = strMeal;
        foodList.appendChild(item);
      });
    } else {
      // displaying a message if no search results are found
      foodList.innerHTML = "<p>No search results found.</p>";
    }
  } catch (error) {
    // handling errors
    console.log(error);
  }
};


// defining a function to display favorite meals on the DOM
const displayFavoriteMeals = () => {
  // clearing previous favorite meals from the DOM
  favoriteList.innerHTML = "";
  // retrieving favorites from local storage
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    // displaying a message if no favorite meals are found
    const message = document.createElement("p");
    message.innerText = "No favorite meals found.";
    favoriteList.appendChild(message);
    return;
  }

  // creating a DOM element for each favorite meal
  favorites.forEach(({ name, area, image }, index) => {
    const item = document.createElement("div");
    item.className = "items";
    item.innerHTML = `
      <img src="${image}" id="foodImg">
      <div class="food-text">
        <label id="text">${name}</label>
        <img src="/Assets/Fav-icon-fill.svg" id="favicon" data-index="${index}">
      </div>
      <label id="des">${area}</label>
    `;
    favoriteList.appendChild(item);

    // adding a click event listener to the favorite icon to remove the meal from favorites
    const favicon = item.querySelector("#favicon");
    favicon.addEventListener("click", () => {
      removeFavoriteMeal(index);
    });

    // adding a click event listener to the favorite meal to redirect to its details page
    favoriteList.addEventListener("click", (e) => {
      const clickedItem = e.target.closest(".items");
      if (e.target.matches("#foodImg")) {
        console.log("click");
        const strMeal = clickedItem.querySelector("#text").textContent;
        console.log("Meal:", strMeal);
        localStorage.setItem("strMeal", strMeal);
        window.location.href = "/mealDetails.html";
      }
    });
  });
};


// defining a function to remove a favorite meal from the list
const removeFavoriteMeal = (index) => {
  // retrieving favorites from local storage
  const favoriteMeals = JSON.parse(localStorage.getItem("favorites")) || [];
  // removing the meal at the given index
  favoriteMeals.splice(index, 1);
  // updating the favorites in local storage
  localStorage.setItem("favorites", JSON.stringify(favoriteMeals));
  // updating the favorites displayed on the DOM
  displayFavoriteMeals();
};


// defining a function to add a meal to favorites
const addFavoriteMeal = (e, isTrue) => {
  // checking if the clicked element is the favorite icon
  if (e.target && event.target.matches("#favicon")) {
    // getting meal information from the clicked item
    const {
      src,
      closest: { querySelector },
      closest,
    } = e.target;
    const isFilled = src.endsWith("Fav-icon-fill.svg");
    const name = querySelector("#text").textContent;
    const image = closest.querySelector("img").src;
    const area = querySelector("#des").textContent;

    // creating a new object to represent the favorite meal
    const item = { name, image, area };
    // retrieving the current list of favorite meals from local storage
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    // finding the index of the meal if it already exists in favorites
    const index = favorites.findIndex(
      ({ name: itemName }) => itemName === item.name
    );

    // adding or removing the meal from favorites based on conditions
    if (isTrue || (!isTrue && !isFilled && index < 0)) {
      favorites.push(item);
      src = "/Assets/Fav-icon-fill.svg";
    } else if (!isTrue || (!isFilled && index >= 0)) {
      favorites.splice(index, 1);
      src = "/Assets/Fav-icon.svg";
    }
    // updating the favorites in local storage
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
};


// Fetches the meal details from the API using the meal name stored in local storage
const mealDetails = async () => {
  // Get the container where the meal details will be displayed
  const infocontainer = document.querySelector(".info-container");

  // Get the meal name from local storage
  const strMeal = localStorage.getItem("strMeal");

  // Build the URL for the API call
  const mealDetails = `https://www.themealdb.com/api/json/v1/1/search.php?s=${strMeal}`;

  try {
    // Make the API call to get the meal details
    const response = await fetch(mealDetails);
    const data = await response.json();

    // Check if the meal is found in the response
    const meal = data.meals && data.meals.length > 0 ? data.meals[0] : null;
    if (!meal) {
      console.log(`No meal found for name ${strMeal}.`);
      return;
    }

    // Display the meal details in the container
    infocontainer.innerHTML = `
      <img src="${meal.strMealThumb}">
      <h1>${meal.strMeal}</h1>
      <span>${meal.strTags}</span>   
      <p>${meal.strInstructions}</p>
      <button id="btn">Watch Tutorial</button>
    `;

    // Add event listener to the button that opens the video tutorial link in a new tab
    const btn = infocontainer.querySelector("#btn");
    btn.addEventListener("click", () => {
      window.open(meal.strYoutube, "_blank");
    });
  } catch (error) {
    console.log(`Error fetching meal details for name ${strMeal}:`, error);
  }
};



// Define a function that takes in a text argument and displays an alert with that text
const message = (text) => {
  alert(text);
};


const handleEventLister = () => {
  // Event listener for search input
  search.addEventListener("input", () => {
    if (search.value) {
      addItemToDom();
    } else {
      foodList.innerHTML = "";
    }
  });

  // Event listener for clicking on a meal item
  foodList.addEventListener("click", (e) => {
    const clickedItem = e.target.closest(".items");
    // If the user clicked on the meal image
    if (e.target.matches("#foodImg")) {
      const strMeal = clickedItem.querySelector("#text").textContent;
      console.log("Meal:", strMeal);
      // Store the clicked meal in localStorage and redirect to the meal details page
      localStorage.setItem("strMeal", strMeal);
      window.location.href = "/mealDetails.html";
    }
  });

  // Event listener for clicking on the favorite icon
  foodList.addEventListener("click", (e) => {
    if (e.target.matches("#favicon")) {
      const target = e.target;
      // Check if the favorite icon is filled or not
      const isFilled = target.src.endsWith("Fav-icon-fill.svg");
      // Get the name, image, and area of the clicked meal
      const mealName = target
        .closest(".items")
        .querySelector("#text").textContent;
      const mealImage = target.closest(".items").querySelector("img").src;
      const mealArea = target
        .closest(".items")
        .querySelector("#des").textContent;

      // Create an object with the meal data
      const item = { name: mealName, image: mealImage, area: mealArea };
      // Get the current list of favorites from localStorage or create a new empty array
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      // Find the index of the clicked meal in the favorites array
      const index = favorites.findIndex(({ name }) => name === item.name);

      // If the favorite icon is filled and the clicked meal is already in the favorites list, remove it
      if (isFilled && index >= 0) {
        favorites.splice(index, 1);
        message("Meal Remove From Favorite List");
      // If the favorite icon is not filled and the clicked meal is not in the favorites list, add it
      } else if (!isFilled && index < 0) {
        favorites.push(item);
        message("Meal Added in Favorite List");
      }
      // Update the favorites list in localStorage
      localStorage.setItem("favorites", JSON.stringify(favorites));
      // Change the icon to filled or unfilled based on whether the meal is in the favorites list or not
      target.src = isFilled
        ? "/Assets/Fav-icon.svg"
        : "/Assets/Fav-icon-fill.svg";
    }
  });
};

// Call the function to set up the event listeners
handleEventLister();

