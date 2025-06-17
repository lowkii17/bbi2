const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
app.use(cors());
app.use(express.json());

// Connect to AWS RDS MySQL database
const connection = mysql.createConnection({
  host: 'database-bbi.c0ds4qem4au4.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'zofzuK-gitga2-niwwew',
  database: 'BBIDatabase'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting:', err.stack);
    return;
  }
  console.log('Connected to AWS RDS as id ' + connection.threadId);
});

// Save a single pallet
app.post('/save-pallet', (req, res) => {
  console.log('Received pallet:', req.body);
  const { shipmentId, data } = req.body;
  connection.query(
    'INSERT INTO pallets (shipmentId, data) VALUES (?, ?)',
    [shipmentId, JSON.stringify(data)],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

// Get all pallets
app.get('/get-pallets', (req, res) => {
  connection.query('SELECT * FROM pallets', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// Save a shipment (delivery with multiple pallets)
app.post('/save-shipment', (req, res) => {
    console.log('Recieved Shipment:', req.body);
  const { mmShipmentId, pallets } = req.body;
  connection.query(
    'INSERT INTO shipments (mmShipmentId, pallets) VALUES (?, ?)',
    [mmShipmentId, JSON.stringify(pallets)],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

// Get all shipments (deliveries)
app.get('/get-shipments', (req, res) => {
  connection.query('SELECT * FROM shipments', (err, results) => {
    if (err) return res.status(500).send(err);
    // Parse pallets JSON for each shipment
    const shipments = results.map(row => ({
      ...row,
      pallets: JSON.parse(row.pallets)
    }));
    res.send(shipments);
  });
});

// Delete a shipment (delivery) by mmShipmentId
app.delete('/delete-shipment/:id', (req, res) => {
  const mmShipmentId = req.params.id;
  connection.query(
    'DELETE FROM shipments WHERE mmShipmentId = ?',
    [mmShipmentId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

app.listen(3001, () => console.log('Server running on port 3001'));
