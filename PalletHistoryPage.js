window.addEventListener('DOMContentLoaded', function() {
  const historyDiv = document.getElementById("PalletHistoryTable");
  const globalSearchInput = document.getElementById("globalSearch");
  let shipments = JSON.parse(localStorage.getItem('submittedPallets') || '[]');

  function renderPallets(globalFilter = "") {
    historyDiv.innerHTML = "";
    const filter = globalFilter.trim().toLowerCase();

    shipments.forEach(shipment => {
      // Check if delivery ID matches filter
      const deliveryIdMatch = shipment.mmShipmentId && shipment.mmShipmentId.toLowerCase().includes(filter);

      // Filter pallets by Pallet ID, Shipment ID, Box Label ID, or Shipment Name
      let filteredPallets = shipment.pallets.filter(pallet => {
        // Pallet ID or Shipment ID match
        if (
          pallet.id.toLowerCase().includes(filter) ||
          pallet.shipmentId.toLowerCase().includes(filter)
        ) return true;

        // Box Label ID or Shipment Name match in any row (except header)
        return (pallet.table || []).some((row, idx) =>
          idx > 0 && (
            (row[0] && row[0].toLowerCase().includes(filter)) || // Box Label ID
            (row[1] && row[1].toLowerCase().includes(filter))    // Shipment Name
          )
        );
      });

      // If nothing matches in this shipment, skip unless deliveryId matches
      if (!deliveryIdMatch && filteredPallets.length === 0) return;

      // --- Delivery Container ---
      const deliveryDiv = document.createElement("div");
      deliveryDiv.className = "mm-shipment-container";
      deliveryDiv.style.margin = "40px 0"; // <-- Edit Delivery container style here

      // Delete button for the whole delivery
      const deleteDeliveryBtn = document.createElement("button");
      deleteDeliveryBtn.textContent = "🗑️";
      deleteDeliveryBtn.title = "Delete Delivery";
      deleteDeliveryBtn.style.fontSize = "20px";
      deleteDeliveryBtn.style.cursor = "pointer";
      deleteDeliveryBtn.style.background = "#c0392b";
      deleteDeliveryBtn.style.color = "white";
      deleteDeliveryBtn.style.border = "none";
      deleteDeliveryBtn.style.borderRadius = "4px";
      deleteDeliveryBtn.style.padding = "4px 8px";
      deleteDeliveryBtn.style.marginRight = "10px";

      // Delivery ID Heading
      const deliveryHeading = document.createElement("h2");
      deliveryHeading.textContent = `Delivery ID: ${shipment.mmShipmentId}`;
      deliveryHeading.style.textAlign = "center";
      deliveryHeading.style.color = "gray";
      deliveryHeading.style.marginBottom = "20px";
      deliveryHeading.style.display = "inline-block";
      deliveryHeading.style.verticalAlign = "middle";

      // Heading container for delete button and heading
      const headingContainer = document.createElement("div");
      headingContainer.style.display = "flex";
      headingContainer.style.alignItems = "center";
      headingContainer.style.justifyContent = "center";
      headingContainer.style.gap = "10px";
      headingContainer.appendChild(deleteDeliveryBtn);
      headingContainer.appendChild(deliveryHeading);

      deliveryDiv.appendChild(headingContainer);

      // If deliveryId matched, show all pallets, else show filtered
      const palletsToShow = deliveryIdMatch ? shipment.pallets : filteredPallets;

      palletsToShow.forEach(pallet => {
        // Pallet container
        const palletContainer = document.createElement("div");
        palletContainer.style.display = "flex";
        palletContainer.style.alignItems = "center";
        palletContainer.style.justifyContent = "center";
        palletContainer.style.gap = "10px";
        palletContainer.dataset.palletId = pallet.id;

        // Pallet heading
        const heading = document.createElement("h2");
        heading.textContent = `Pallet ${pallet.id.split('-')[1]} (${pallet.shipmentId})`;
        heading.style.textAlign = "center";
        heading.style.color = "white";
        heading.style.margin = "0";

        palletContainer.appendChild(heading);
        deliveryDiv.appendChild(palletContainer);

        // Table
        const table = document.createElement("table");
        table.id = pallet.id;
        const tableBody = document.createElement("tbody");

        (pallet.table || []).forEach((rowData, rowIndex) => {
          const row = document.createElement("tr");
          rowData.forEach((cellData, colIndex) => {
            let cell = rowIndex === 0
              ? document.createElement("th")
              : document.createElement("td");
            cell.textContent = cellData;
            row.appendChild(cell);
          });
          tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        deliveryDiv.appendChild(table);

        // Style (optional)
        table.style.fontSize = "25px";
        table.style.color = "beige";
        table.style.border = "5px solid black";
        table.style.paddingTop = "1px";
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        const cells = table.querySelectorAll("td, th");
        cells.forEach(cell => {
          cell.style.border = "1px solid black";
          cell.style.padding = "15px";
          cell.style.textAlign = "center";
        });
      });

      // Delete delivery function
      deleteDeliveryBtn.addEventListener("click", function() {
        historyDiv.removeChild(deliveryDiv);
        // Remove from localStorage
        let shipments = JSON.parse(localStorage.getItem('submittedPallets') || '[]');
        shipments = shipments.filter(s => s.mmShipmentId !== shipment.mmShipmentId);
        localStorage.setItem('submittedPallets', JSON.stringify(shipments));
        renderPallets(globalSearchInput.value.trim());
      });

      historyDiv.appendChild(deliveryDiv);
    });

    if (!historyDiv.innerHTML) {
      historyDiv.innerHTML = "<p style='color:white;text-align:center;'>No pallets found.</p>";
    }
  }

  // Initial render
  renderPallets();

  // Global search handler
  globalSearchInput.addEventListener("input", function() {
    renderPallets(this.value);
  });
});