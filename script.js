/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
// Store selected products in an array
let selectedProducts = [];

// Function to display products and enable selection
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product, idx) => `
    <div class="product-card" data-index="${idx}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `
    )
    .join("");

  // Add click event listeners to each product card
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card, idx) => {
    card.addEventListener("click", () => {
      // Get the product from the current filtered list
      const product = products[idx];
      // Check if already selected
      const alreadySelected = selectedProducts.find(
        (p) => p.name === product.name && p.brand === product.brand
      );
      if (alreadySelected) {
        // If already selected, remove from selectedProducts
        selectedProducts = selectedProducts.filter(
          (p) => !(p.name === product.name && p.brand === product.brand)
        );
        card.classList.remove("selected");
      } else {
        // Add to selectedProducts
        selectedProducts.push(product);
        card.classList.add("selected");
      }
      // Update the selected products display
      updateSelectedProductsList();
    });
  });
}

// Function to save selected products to local storage or fallback
function saveSelectedProducts() {
  try {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  } catch (error) {
    console.warn("LocalStorage is not available. Data will not persist.");
  }
}

// Function to load selected products from local storage or fallback
function loadSelectedProducts() {
  try {
    const savedProducts = localStorage.getItem("selectedProducts");
    if (savedProducts) {
      selectedProducts = JSON.parse(savedProducts);
      updateSelectedProductsList();
      // Highlight selected product cards
      const productCards = document.querySelectorAll(".product-card");
      selectedProducts.forEach((prod) => {
        Array.from(productCards).forEach((card) => {
          if (
            card.querySelector("h3").textContent === prod.name &&
            card.querySelector("p").textContent === prod.brand
          ) {
            card.classList.add("selected");
          }
        });
      });
    }
  } catch (error) {
    console.warn("LocalStorage is not available. Data will not persist.");
  }
}

// Call loadSelectedProducts when the page loads
window.addEventListener("load", loadSelectedProducts);

// Function to update the selected products area
function updateSelectedProductsList() {
  const selectedList = document.getElementById("selectedProductsList");
  if (!selectedList) return;
  if (selectedProducts.length === 0) {
    selectedList.innerHTML = `<div class=\"placeholder-message\">No products selected yet.</div>`;
    saveSelectedProducts(); // Save empty state
    return;
  }
  selectedList.innerHTML = selectedProducts
    .map(
      (product, idx) => `
        <div class="selected-product-item" style="display: block;"> <!-- Ensure one product per line -->
          <img src="${product.image}" alt="${product.name}" title="${product.name}" />
          <span>${product.name}</span>
          <button class="remove-selected" data-index="${idx}" title="Remove">&times;</button>
        </div>
      `
    )
    .join("");

  // Add remove button functionality
  const removeBtns = document.querySelectorAll(".remove-selected");
  removeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(btn.getAttribute("data-index"));
      selectedProducts.splice(idx, 1);
      updateSelectedProductsList();
      saveSelectedProducts(); // Save updated state
      // Also update product card highlight
      const productCards = document.querySelectorAll(".product-card");
      productCards.forEach((card) => card.classList.remove("selected"));
      selectedProducts.forEach((prod) => {
        Array.from(productCards).forEach((card) => {
          if (
            card.querySelector("h3").textContent === prod.name &&
            card.querySelector("p").textContent === prod.brand
          ) {
            card.classList.add("selected");
          }
        });
      });
    });
  });
  saveSelectedProducts(); // Save updated state
}

// Add a "Clear All" button to the selected products section
const clearAllBtn = document.createElement("button");
clearAllBtn.id = "clearAllBtn";
clearAllBtn.textContent = "Clear All";
clearAllBtn.className = "generate-btn";
clearAllBtn.style.marginTop = "10px";
clearAllBtn.addEventListener("click", () => {
  selectedProducts = [];
  updateSelectedProductsList();
  saveSelectedProducts();
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => card.classList.remove("selected"));
});

// Append the "Clear All" button to the selected products section
const selectedProductsSection = document.querySelector(".selected-products");
selectedProductsSection.appendChild(clearAllBtn);

// Generate Routine button handler
const generateRoutineBtn = document.getElementById("generateRoutine");
if (generateRoutineBtn) {
  generateRoutineBtn.addEventListener("click", async () => {
    // If no products selected, show a message
    if (selectedProducts.length === 0) {
      chatWindow.innerHTML += `<div class="assistant-message error"><strong>Assistant:</strong> Please select products before generating a routine.</div>`;
      return;
    }

    // Show loading message
    chatWindow.innerHTML += `<div class="assistant-message loading">Generating your personalized routine...</div>`;

    // Create a prompt for the assistant
    const productNames = selectedProducts
      .map((p) => `${p.name} (${p.brand})`)
      .join(", ");
    const prompt = `Create a personalized beauty routine using these L'Oréal products: ${productNames}. List the steps and explain how to use each product.`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "alt-svc": 'h3=":443"; ma=86400',
            "cf-ray": "95fe6c4f21c5a4d6-mia",
            connection: "keep-alive",
            "content-length": "12",
            "content-type": "text/plain;charset=utf-8",
            date: "wed, 16 jul 2025 03:30:49 gmt",
            nel: '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
            "report-to":
              '{"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=d93hlodujeypzkhnhhp0lywspat1yeoaal%2fqffwhfbzzmmsh1ipqgrq%2b8urzkdarbzoukicesmsmltypib69dhyfk9uhuatb2lfaxi8%2ft4xagv71nbrf8tu3mli9zayi0dcsnnu81epxzt0kmutttzgzmeekwdjkmwttsfny5xsejh2t7e6a"}],"group":"cf-nel","max_age":604800}',
            server: "cloudflare",
            "server-timing":
              'cfl4;desc="?proto=tcp&rtt=929&min_rtt=902&rtt_var=289&sent=5&recv=8&lost=0&retrans=0&sent_bytes=3030&recv_bytes=3852&delivery_rate=3210643&cwnd=253&unsent_bytes=0&cid=2c8df491993dd08d&ts=326&x=0"',
            vary: "accept-encoding",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful beauty and skincare assistant for L'Oréal.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 300,
          }),
        }
      );
      const data = await response.json();
      // Remove loading message
      const loadingMsg = chatWindow.querySelector(".assistant-message.loading");
      if (loadingMsg) loadingMsg.remove();
      if (data.error) {
        chatWindow.innerHTML += `<div class="assistant-message error"><strong>Assistant:</strong> Sorry, there was an error: ${data.error.message}</div>`;
        return;
      }
      let routine = data.choices[0].message.content;
      // Format routine steps to skip a line between each step
      routine = routine.replace(/\d+\.\s/g, (match) => `\n${match}`);
      chatWindow.innerHTML += `<div class="assistant-message"><strong>Personalized Routine:</strong><br>${routine}</div>`;
    } catch (error) {
      const loadingMsg = chatWindow.querySelector(".assistant-message.loading");
      if (loadingMsg) loadingMsg.remove();
      chatWindow.innerHTML += `<div class="assistant-message error"><strong>Assistant:</strong> Sorry, there was a problem connecting to the API.</div>`;
    }
  });
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
// Chat form submission handler - connects to OpenAI API
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message from the input field
  const userInput = document.getElementById("userInput").value;

  // Show the user's message in the chat window
  chatWindow.innerHTML += `<div class="user-message"><strong>You:</strong> ${userInput}</div>`;

  // Show a loading message while waiting for the API
  chatWindow.innerHTML += `<div class="beauty-advisor-message loading">Beauty Advisor is typing...</div>`;

  // Call the OpenAI API using fetch
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`, // Use your API key from secrets.js
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use the gpt-4o model
        messages: [
          {
            role: "system",
            content:
              "You are a real L'Oréal advisor. Provide detailed information about L'Oréal products, help users pick suitable products, and assist them in generating personalized routines. Answer follow-up questions about routines and products.",
          },
          { role: "user", content: userInput },
        ],
        max_tokens: 200,
      }),
    });

    // Parse the response as JSON
    const data = await response.json();

    // Remove the loading message
    chatWindow.querySelector(".beauty-advisor-message.loading").remove();

    // Check for an error from the API
    if (data.error) {
      chatWindow.innerHTML += `<div class="beauty-advisor-message error"><strong>Beauty Advisor:</strong> Sorry, there was an error: ${data.error.message}</div>`;
      return;
    }

    // Get the beauty advisor's reply from the API response
    const beautyAdvisorReply = data.choices[0].message.content;

    // Show the beauty advisor's reply in the chat window
    chatWindow.innerHTML += `<div class="beauty-advisor-message"><strong>Beauty Advisor:</strong> ${beautyAdvisorReply}</div>`;
  } catch (error) {
    // Remove the loading message if there's an error
    const loadingMsg = chatWindow.querySelector(
      ".beauty-advisor-message.loading"
    );
    if (loadingMsg) loadingMsg.remove();
    // Show the error in the chat window
    chatWindow.innerHTML += `<div class="beauty-advisor-message error"><strong>Beauty Advisor:</strong> Sorry, there was a problem connecting to the API.</div>`;
  }

  // Clear the input field after sending
  document.getElementById("userInput").value = "";
});
