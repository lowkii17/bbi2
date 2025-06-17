let palletCount = 1;

document.getElementById("CreatePalletButton").addEventListener("click", function() {
  const shipmentId = `SHIP-${Date.now()}-${palletCount}`;

  // --- UI creation code (unchanged) ---
  const palletContainer = document.createElement("div");
  palletContainer.style.display = "flex";
  palletContainer.style.alignItems = "center";
  palletContainer.style.justifyContent = "center";
  palletContainer.style.gap = "10px";
  palletContainer.dataset.palletId = `pallet-${palletCount}`;

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

  const heading = document.createElement("h2");
  heading.textContent = `Pallet ${palletCount} (${shipmentId})`;
  heading.style.textAlign = "center";
  heading.style.color = "white";
  heading.style.margin = "0";

  palletContainer.appendChild(deleteBtn);
  palletContainer.appendChild(heading);

  const palletId = `pallet-${palletCount}`;
  const table = document.createElement("table");
  table.id = palletId;
  const tableBody = document.createElement("tbody");

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

        if (colIndex === 2) {
          input.readOnly = true;
          dateInput = input;
        }
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
        let debounceTimer = null;
        input.addEventListener("input", function() {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const currentRow = rowIndex;
            const nextRow = input.closest("table").rows[currentRow + 1];
            if (nextRow) {
              const nextInput = nextRow.cells[colIndex]?.querySelector("input");
              if (nextInput) {
                nextInput.focus();
              }
            }
          }, 1000);
        });

        cell.appendChild(input);
      }
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  const palletDiv = document.getElementById("PalletTable");
  if (palletDiv.firstChild) {
    palletDiv.insertBefore(palletContainer, palletDiv.firstChild);
    palletDiv.insertBefore(table, palletContainer.nextSibling);
  } else {
    palletDiv.appendChild(palletContainer);
    palletDiv.appendChild(table);
  }

  setTimeout(() => {
    const firstInput = table.rows[1]?.cells[0]?.querySelector("input");
    if (firstInput) firstInput.focus();
  }, 0);

  // --- Save to backend instead of localStorage ---
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

  fetch('http://192.168.200.196:3001/save-pallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipmentId, data: tableContent })
  });

  deleteBtn.addEventListener("click", function() {
    palletDiv.removeChild(palletContainer);
    palletDiv.removeChild(table);
    updateSubmitButtonState();
    // Optionally: send a request to backend to delete the pallet from DB
  });

  palletCount++;
  updateSubmitButtonState();
});

function updateSubmitButtonState() {
  const palletDiv = document.getElementById("PalletTable");
  const containers = palletDiv.querySelectorAll("div[data-pallet-id]");
  const submitBtn = document.getElementById("SubmitPalletButton");
  submitBtn.disabled = containers.length === 0;
}

// --- Restore pallets and tables on page load from backend ---
window.addEventListener('DOMContentLoaded', () => {
  fetch('http://192.168.200.196:3001/get-pallets')
    .then(res => res.json())
    .then(pallets => {
      palletCount = 1;
      const palletDiv = document.getElementById("PalletTable");
      palletDiv.innerHTML = "";
      pallets.forEach(pallet => {
        const tableData = JSON.parse(pallet.data);

        // --- UI creation code (same as above, refactored for reuse) ---
        const palletContainer = document.createElement("div");
        palletContainer.style.display = "flex";
        palletContainer.style.alignItems = "center";
        palletContainer.style.justifyContent = "center";
        palletContainer.style.gap = "10px";
        palletContainer.dataset.palletId = `pallet-${palletCount}`;

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

        const heading = document.createElement("h2");
        heading.textContent = `Pallet ${palletCount} (${pallet.shipmentId})`;
        heading.style.textAlign = "center";
        heading.style.color = "white";
        heading.style.margin = "0";

        palletContainer.appendChild(deleteBtn);
        palletContainer.appendChild(heading);

        const palletId = `pallet-${palletCount}`;
        const table = document.createElement("table");
        table.id = palletId;
        const tableBody = document.createElement("tbody");

        (tableData || []).forEach((rowData, rowIndex) => {
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

              if (colIndex === 2) {
                input.readOnly = true;
                dateInput = input;
              }
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
              let debounceTimer = null;
              input.addEventListener("input", function() {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                  const currentRow = rowIndex;
                  const nextRow = input.closest("table").rows[currentRow + 1];
                  if (nextRow) {
                    const nextInput = nextRow.cells[colIndex]?.querySelector("input");
                    if (nextInput) {
                      nextInput.focus();
                    }
                  }
                }, 1000);
              });

              cell.appendChild(input);
            }
            row.appendChild(cell);
          });
          tableBody.appendChild(row);
        });

        table.appendChild(tableBody);

        if (palletDiv.firstChild) {
          palletDiv.insertBefore(palletContainer, palletDiv.firstChild);
          palletDiv.insertBefore(table, palletContainer.nextSibling);
        } else {
          palletDiv.appendChild(palletContainer);
          palletDiv.appendChild(table);
        }

        setTimeout(() => {
          const firstInput = table.rows[1]?.cells[0]?.querySelector("input");
          if (firstInput) firstInput.focus();
        }, 0);

        deleteBtn.addEventListener("click", function() {
          palletDiv.removeChild(palletContainer);
          palletDiv.removeChild(table);
          updateSubmitButtonState();
        });

        palletCount++;
      });
      updateSubmitButtonState();
    });
});
