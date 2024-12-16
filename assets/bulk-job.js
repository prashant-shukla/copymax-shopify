document.addEventListener("DOMContentLoaded", function () {
    let totalJobs = 1;

    // Function to get the selected variant's price from the data-selected-variant script
    function getCurrentVariantPrice() {
        const variantDataScript = document.querySelector('script[data-selected-variant]');
        const variantData = JSON.parse(variantDataScript.textContent);
        console.log("Variant data fetched:", variantData); // Debug log to check fetched data
        return parseFloat(variantData.price) / 100; // Convert from cents to dollars
    }

    // Function to update all job prices with the current selected variant's price
    function updateAllJobPrices(newPrice) {
        console.log("Updating all job prices with new price:", newPrice); // Debug log for price update
        const jobRows = document.querySelectorAll(".job-row");
        jobRows.forEach((row) => {
            const qty = parseInt(row.querySelector("input[name='job_qty[]']").value) || 1;
            console.log("Updating job row price for qty:", qty); // Debug log for each row
            row.querySelector(".price").dataset.price = newPrice;
            row.querySelector(".job-price").innerText = (newPrice * qty).toFixed(2);
        });
        updateTotals();
    }

    // Update totals
    function updateTotals() {
        const prices = document.querySelectorAll(".job-price");
        let subtotal = 0;

        prices.forEach((price) => {
            subtotal += parseFloat(price.innerText);
        });

        console.log("Updating totals. Subtotal:", subtotal); // Debug log for subtotal
        document.getElementById("subtotal").innerText = subtotal.toFixed(2);
        document.getElementById("total").innerText = subtotal.toFixed(2);
        document.getElementById("total-jobs").value = totalJobs;
    }

    // Add a new job row with the correct price
    function addJobRow(price) {
        console.log("Adding a new job row with price:", price); // Debug log for adding job row
        totalJobs++;

        const jobRow = document.createElement("div");
        jobRow.classList.add("job-row");

        jobRow.innerHTML = `
            <input type="text" name="job_name[]" placeholder="Job Name/PO# (Required)" required>
            <input type="number" name="job_qty[]" min="1" value="1" required oninput="updatePrice(this)">
            <span class="price" data-price="${price}">$<span class="job-price">${price.toFixed(2)}</span></span>
            <button type="button" class="remove-job">&#128465;</button>
        `;

        jobRow.querySelector(".remove-job").addEventListener("click", function () {
            removeJob(this);
        });

        document.getElementById("job-rows").appendChild(jobRow);
        updateTotals();
    }

    // Remove a job row
    function removeJob(button) {
        if (totalJobs > 1) {
            const jobRow = button.parentElement;
            jobRow.remove();
            totalJobs--;
            updateTotals();
        }
    }

    // Update price for a single row
    window.updatePrice = function (input) {
        const qty = parseInt(input.value) || 1;
        const priceSpan = input.parentElement.querySelector(".job-price");
        const basePrice = parseFloat(input.parentElement.querySelector(".price").dataset.price);

        console.log("Updating price for job row. Quantity:", qty, "Base price:", basePrice); // Debug log for price update
        priceSpan.innerText = (qty * basePrice).toFixed(2);
        updateTotals();
    };

    // Add job button handler
    document.getElementById("add-job-btn").addEventListener("click", function () {
        const price = getCurrentVariantPrice();
        console.log("Add job button clicked. Current variant price:", price); // Debug log for add job button
        addJobRow(price);
    });

    // Function to handle delayed price update after variant change
    function handleVariantChange() {
        console.log("Variant changed, waiting for price update..."); // Debug log for variant change
        setTimeout(() => {
            const newPrice = getCurrentVariantPrice();
            console.log("New price after delay:", newPrice); // Debug log for price after delay
            updateAllJobPrices(newPrice);
        }, 1500); // Add a delay of 1500ms to ensure price update from server
    }

    // Event delegation to handle both dropdown and radio button changes
    document.querySelector(".product__info-container").addEventListener("change", function (event) {
        // Check if a dropdown or radio button was changed
        if (
            event.target &&
            (event.target.classList.contains("select__select") || // Dropdown
                event.target.type === "radio") // Radio button
        ) {
            console.log("Variant selection changed:", event.target); // Debug log for variant change
            handleVariantChange();
        }
    });

    // Initialize with the currently selected variant's price
    function initialize() {
        const price = getCurrentVariantPrice();
        console.log("Initializing with current variant price:", price); // Debug log for initialization
        const firstRow = document.querySelector(".job-row .price");
        if (firstRow) {
            firstRow.dataset.price = price;
            firstRow.querySelector(".job-price").innerText = price.toFixed(2);
        }
        updateTotals();
    }

    // Call initialize when the page is loaded
    initialize();
});
