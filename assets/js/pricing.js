document.addEventListener("DOMContentLoaded", () => {
  const viewByProviderBtn = document.getElementById("view-by-provider");
  const viewByCostBtn = document.getElementById("view-by-cost");
  const providerSections = document.querySelectorAll(".provider-section");
  const pricingViews = document.getElementById("pricing-views");

  const costSections = document.createElement("div");
  costSections.id = "cost-sections";
  costSections.style.display = "none";

  const pricingData = {
    affordable: [],
    intermediate: [],
    advanced: [],
  };

  providerSections.forEach((providerSection) => {
    const pricingCards = providerSection.querySelectorAll(".pricing-card");
    pricingCards.forEach((card) => {
      const priceText = card.querySelector(".price").textContent;
      const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
      const cardData = {
        price,
        element: card.cloneNode(true),
      };

      if (price < 5) {
        pricingData.affordable.push(cardData);
      } else if (price >= 5 && price < 20) {
        pricingData.intermediate.push(cardData);
      } else {
        pricingData.advanced.push(cardData);
      }
    });
  });

  // Sort each tier by price
  for (const tier in pricingData) {
    pricingData[tier].sort((a, b) => a.price - b.price);
  }

  const createCostSection = (title, models) => {
    const section = document.createElement("div");
    section.classList.add("provider-section");

    const header = document.createElement("div");
    header.classList.add("provider-header");

    const icon = document.createElement("div");
    icon.classList.add("provider-icon");
    icon.innerHTML = '<i class="fas fa-dollar-sign"></i>';

    const sectionTitle = document.createElement("h2");
    sectionTitle.classList.add("provider-title");
    sectionTitle.textContent = title;

    header.appendChild(icon);
    header.appendChild(sectionTitle);

    const container = document.createElement("div");
    container.classList.add("pricing-container");

    models.forEach((model) => {
      container.appendChild(model.element);
    });

    section.appendChild(header);
    section.appendChild(container);

    return section;
  };

  costSections.appendChild(
    createCostSection("Affordable Models (< $5)", pricingData.affordable)
  );
  costSections.appendChild(
    createCostSection("Intermediate Models ($5 - $20)", pricingData.intermediate)
  );
  costSections.appendChild(
    createCostSection("Advanced Models (> $20)", pricingData.advanced)
  );

  pricingViews.appendChild(costSections);

  viewByProviderBtn.addEventListener("click", () => {
    providerSections.forEach((section) => (section.style.display = "block"));
    costSections.style.display = "none";
    viewByProviderBtn.classList.add("btn-primary");
    viewByProviderBtn.classList.remove("btn-outline");
    viewByCostBtn.classList.add("btn-outline");
    viewByCostBtn.classList.remove("btn-primary");
  });

  viewByCostBtn.addEventListener("click", () => {
    providerSections.forEach((section) => (section.style.display = "none"));
    costSections.style.display = "block";
    viewByCostBtn.classList.add("btn-primary");
    viewByCostBtn.classList.remove("btn-outline");
    viewByProviderBtn.classList.add("btn-outline");
    viewByProviderBtn.classList.remove("btn-primary");
  });
});