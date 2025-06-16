let palletCount = 1;

document.getElementById("CreatePalletButton").addEventListener("click", function() {
  // Generate a unique shipment ID (for example, using timestamp and palletCount)
  const shipmentId = `SHIP-${Date.now()}-${palletCount}`;

  // Create a container for the heading and delete button
  const palletContainer = document.createElement("div");
  palletContainer.style.display = "flex";
  palletContainer.style.alignItems = "center";
  palletContainer.style.justifyContent = "center";
  palletContainer.style.gap = "10px";
  palletContainer.dataset.palletId = `pallet-${palletCount}`;

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.title = "Delete Pallet";
  deleteBtn.style.fontSize = "20px";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.background = "#c0392b";
  deleteBtn.style.color = "white";
  deleteBtn.style.border = "none";
  deleteBtn.style.borderRadius = "4px";
  deleteBtn.style.padding = "4px 8px";

  // Create and insert heading above the table, showing shipment ID in parenthesis
  const heading = document.createElement("h2");
  heading.textContent = `Pallet ${palletCount} (${shipmentId})`;
  heading.style.textAlign = "center";
  heading.style.color = "white";
  heading.style.margin = "0";

  palletContainer.appendChild(deleteBtn);
  palletContainer.appendChild(heading);

  // Create a unique ID for this pallet
  const palletId = `pallet-${palletCount}`;

  // Create the table and assign the ID
  const table = document.createElement("table");
  table.id = palletId;
  const tableBody = document.createElement("tbody");

  // Default table data
  const tableData = [
    ["Box Label ID", "Shipment Name", "Date"],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ];

  tableData.forEach((rowData, rowIndex) => {
    const row = document.createElement("tr");
    let dateInput = null;
    rowData.forEach((cellData, colIndex) => {
      let cell = rowIndex === 0
        ? document.createElement("th")
        : document.createElement("td");
      if (rowIndex === 0) {
        cell.textContent = cellData;
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.style.width = "100%";
        input.style.color = "black";
        input.value = cellData;

        // If this is the date column, make it read-only and save reference
        if (colIndex === 2) {
          input.readOnly = true;
          dateInput = input;
        }

        // If this is the Box Label ID column, add event listener to auto-generate date
        if (colIndex === 0) {
          input.addEventListener("input", function() {
            if (dateInput && !dateInput.value) {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              dateInput.value = `${yyyy}-${mm}-${dd}`;
            }
          });
        }

        // --- Debounced auto-advance to next row's input in the same column ---
        let debounceTimer = null;
        input.addEventListener("input", function() {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            // Only auto-advance if not the last row
            const currentRow = rowIndex;
            const nextRow = input.closest("table").rows[currentRow + 1];
            if (nextRow) {
              const nextInput = nextRow.cells[colIndex]?.querySelector("input");
              if (nextInput) {
                nextInput.focus();
              }
            }
          }, 1000); // 1 second debounce
        });

        cell.appendChild(input);
      }
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  // Now insert the container and table at the top
  const palletDiv = document.getElementById("PalletTable");
  if (palletDiv.firstChild) {
    palletDiv.insertBefore(palletContainer, palletDiv.firstChild);
    palletDiv.insertBefore(table, palletContainer.nextSibling);
  } else {
    palletDiv.appendChild(palletContainer);
    palletDiv.appendChild(table);
  }

  // Auto-focus the first input in the first data row (Box Label ID)
  setTimeout(() => {
    const firstInput = table.rows[1]?.cells[0]?.querySelector("input");
    if (firstInput) firstInput.focus();
  }, 0);

  // Save all input data for this pallet
  // Gather current table data
  const tableInputs = table.querySelectorAll("tr");
  const tableContent = [];
  tableInputs.forEach((tr, rowIndex) => {
    const rowArr = [];
    tr.querySelectorAll("th, td").forEach((cell, colIndex) => {
      if (rowIndex === 0) {
        rowArr.push(cell.textContent);
      } else {
        const input = cell.querySelector("input");
        rowArr.push(input ? input.value : "");
      }
    });
    tableContent.push(rowArr);
  });

  // After creating a new pallet, save its info and table data
  let pallets = JSON.parse(localStorage.getItem('pallets') || '[]');
  pallets.push({ id: palletId, shipmentId, created: new Date().toISOString(), table: tableContent });
  localStorage.setItem('pallets', JSON.stringify(pallets));

  // Delete pallet function
  deleteBtn.addEventListener("click", function() {
    // Remove from DOM
    palletDiv.removeChild(palletContainer);
    palletDiv.removeChild(table);
    // Remove from localStorage
    let pallets = JSON.parse(localStorage.getItem('pallets') || '[]');
    pallets = pallets.filter(p => p.id !== palletId);
    localStorage.setItem('pallets', JSON.stringify(pallets));
  });

  // Increment the pallet count for the next button press
  palletCount++;

  // Update submit button state
  updateSubmitButtonState();
});

// Utility function to enable/disable the submit button
function updateSubmitButtonState() {
  const palletDiv = document.getElementById("PalletTable");
  const containers = palletDiv.querySelectorAll("div[data-pallet-id]");
  const submitBtn = document.getElementById("SubmitPalletButton");
  submitBtn.disabled = containers.length === 0;
}

// Restore pallets and tables on page load
window.addEventListener('DOMContentLoaded', function() {
  updateSubmitButtonState();
  let pallets = JSON.parse(localStorage.getItem('pallets') || '[]');
  pallets.forEach(pallet => {
    // Create a container for the heading and delete button
    const palletContainer = document.createElement("div");
    palletContainer.style.display = "flex";
    palletContainer.style.alignItems = "center";
    palletContainer.style.justifyContent = "center";
    palletContainer.style.gap = "10px";
    palletContainer.dataset.palletId = pallet.id;

    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.title = "Delete Pallet";
    deleteBtn.style.fontSize = "20px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.background = "#c0392b";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.padding = "4px 8px";

    // Recreate heading
    const heading = document.createElement("h2");
    heading.textContent = `Pallet ${pallet.id.split('-')[1]} (${pallet.shipmentId})`;
    heading.style.textAlign = "center";
    heading.style.color = "white";
    heading.style.margin = "0";

    palletContainer.appendChild(deleteBtn);
    palletContainer.appendChild(heading);
    document.getElementById("PalletTable").appendChild(palletContainer);

    // Recreate table
    const table = document.createElement("table");
    table.id = pallet.id;
    const tableBody = document.createElement("tbody");

    (pallet.table || []).forEach((rowData, rowIndex) => {
      const row = document.createElement("tr");
      let dateInput = null;
      rowData.forEach((cellData, colIndex) => {
        let cell = rowIndex === 0
          ? document.createElement("th")
          : document.createElement("td");
        if (rowIndex === 0) {
          cell.textContent = cellData;
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.style.width = "100%";
          input.style.color = "black";
          input.value = cellData;

          // If this is the date column, make it read-only and save reference
          if (colIndex === 2) {
            input.readOnly = true;
            dateInput = input;
          }
          // If this is the Box Label ID column, add event listener to auto-generate date
          if (colIndex === 0) {
            input.addEventListener("input", function() {
              if (dateInput && !dateInput.value) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                dateInput.value = `${yyyy}-${mm}-${dd}`;
              }
            });
          }

          // --- Debounced auto-advance to next row's input in the same column ---
          let debounceTimer = null;
          input.addEventListener("input", function() {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              // Only auto-advance if not the last row
              const currentRow = rowIndex;
              const nextRow = input.closest("table").rows[currentRow + 1];
              if (nextRow) {
                const nextInput = nextRow.cells[colIndex]?.querySelector("input");
                if (nextInput) {
                  nextInput.focus();
                }
              }
            }, 1000); // 1 second debounce
          });

          cell.appendChild(input);
        }
        row.appendChild(cell);
      });
      tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    document.getElementById("PalletTable").appendChild(table);

    // Style the table (optional)
    table.style.fontSize = "25px";
    table.style.color = "beige";
    table.style.border = "5px solid black";
    table.style.paddingTop = "1px";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // Style the cells
    const cells = table.querySelectorAll("td, th");
    cells.forEach(cell => {
      cell.style.border = "1px solid black";
      cell.style.padding = "15px";
      cell.style.textAlign = "center";
    });

    // Delete pallet function for restored pallets
    deleteBtn.addEventListener("click", function() {
      document.getElementById("PalletTable").removeChild(palletContainer);
      document.getElementById("PalletTable").removeChild(table);
      let pallets = JSON.parse(localStorage.getItem('pallets') || '[]');
      pallets = pallets.filter(p => p.id !== pallet.id);
      localStorage.setItem('pallets', JSON.stringify(pallets));
      updateSubmitButtonState();
    });
  });

  // Set palletCount to next available number
  if (pallets.length > 0) {
    const last = pallets[pallets.length - 1];
    const lastNum = parseInt(last.id.split('-')[1], 10);
    palletCount = lastNum + 1;
  }
  updateSubmitButtonState();
});

document.getElementById("SavePalletButton").addEventListener("click", function() {
  // Get all pallet containers
  const palletDiv = document.getElementById("PalletTable");
  const containers = palletDiv.querySelectorAll("div[data-pallet-id]");

  // Prepare array to hold all pallets' data
  const pallets = [];

  containers.forEach(container => {
    const palletId = container.dataset.palletId;
    const heading = container.querySelector("h2");
    // Extract shipmentId from heading text
    const match = heading.textContent.match(/\(([^)]+)\)/);
    const shipmentId = match ? match[1] : "";

    // Find the table that follows this container
    let table = container.nextElementSibling;
    if (!table || table.tagName.toLowerCase() !== "table") return;

    const tableContent = [];
    const rows = table.querySelectorAll("tr");
    rows.forEach((tr, rowIndex) => {
      const rowArr = [];
      tr.querySelectorAll("th, td").forEach((cell, colIndex) => {
        if (rowIndex === 0) {
          rowArr.push(cell.textContent);
        } else {
          const input = cell.querySelector("input");
          rowArr.push(input ? input.value : "");
        }
      });
      tableContent.push(rowArr);
    });

    pallets.push({
      id: palletId,
      shipmentId,
      created: new Date().toISOString(),
      table: tableContent
    });
  });

  // Save all pallets to localStorage
  localStorage.setItem('pallets', JSON.stringify(pallets));
  alert("Pallet data saved!");
});

document.getElementById("SubmitPalletButton").addEventListener("click", function() {
  // Get all pallet containers
  const palletDiv = document.getElementById("PalletTable");
  const containers = palletDiv.querySelectorAll("div[data-pallet-id]");
  const pallets = [];

  containers.forEach(container => {
    const palletId = container.dataset.palletId;
    const heading = container.querySelector("h2");
    // Extract shipmentId from heading text
    const match = heading.textContent.match(/\(([^)]+)\)/);
    const shipmentId = match ? match[1] : "";

    // Find the table that follows this container
    let table = container.nextElementSibling;
    if (!table || table.tagName.toLowerCase() !== "table") return;

    const tableContent = [];
    const rows = table.querySelectorAll("tr");
    rows.forEach((tr, rowIndex) => {
      const rowArr = [];
      tr.querySelectorAll("th, td").forEach((cell, colIndex) => {
        if (rowIndex === 0) {
          rowArr.push(cell.textContent);
        } else {
          const input = cell.querySelector("input");
          rowArr.push(input ? input.value : "");
        }
      });
      tableContent.push(rowArr);
    });

    pallets.push({
      id: palletId,
      shipmentId,
      created: new Date().toISOString(),
      table: tableContent
    });
  });

  // --- Group into Delivery ---
  const deliveryId = `DELIVERY-${Date.now()}`;
  let submitted = JSON.parse(localStorage.getItem('submittedPallets') || '[]');
  submitted.push({
    mmShipmentId: deliveryId, // Keep the property name for compatibility with history page
    pallets
  });
  localStorage.setItem('submittedPallets', JSON.stringify(submitted));
  alert(`Pallets submitted as Delivery: ${deliveryId}`);

  // --- Remove all pallets from the Home page and clear from localStorage ---
  // Remove all pallet containers and tables from the DOM
  const allContainers = palletDiv.querySelectorAll("div[data-pallet-id]");
  allContainers.forEach(container => {
    // Remove the table that follows the container
    let table = container.nextElementSibling;
    if (table && table.tagName.toLowerCase() === "table") {
      palletDiv.removeChild(table);
    }
    // Remove the container itself
    palletDiv.removeChild(container);
  });

  // Clear the pallets from localStorage (but keep submittedPallets)
  localStorage.removeItem('pallets');

  // Update submit button state after submitting (disables button if no tables)
  updateSubmitButtonState();
});

// After creating a pallet, update submit button state
updateSubmitButtonState();

// After deleting a pallet, update submit button state
deleteBtn.addEventListener("click", function() {
  // ...existing code...
  updateSubmitButtonState();
});
