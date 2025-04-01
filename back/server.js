const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Employee = require("./models/employeeScannedData");

const app = express();
app.use(express.json());
app.use(cors());

//Reikia pasidaryti .env file su sia data
const api = process.env.API_CONNECTION_STRING;
const clientKey = process.env.CLIENT_KEY;
const clientSecret = process.env.CLIENT_SECRET;
const port = process.env.PORT || 8080;
const mongo = process.env.MONGO;

//Prisijungiame prie Mongo DB
mongoose.connect(mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

//Base64 auth
function getAuthentication() {
  const credentials = Buffer.from(`${clientKey}:${clientSecret}`).toString('base64');
  return {
    Authorization: `Basic ${credentials}`,
  };
}

//Gauname users data
app.get('/users', async (req, res) => {
  try {
    const response = await axios.get(`${api}/employees`, {
      headers: getAuthentication(),
    });
    res.json(response.data.pagedList.data || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee data' });
  }
});

//Gauname inventoriaus data
app.get('/inventory', async (req, res) => {
  try {
    const response = await axios.get(`${api}/inventory/productList`, {
      headers: getAuthentication(),
    });
    res.json(response.data || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory data' });
  }
});

//Gauname proektu data
app.get('/projects', async (req, res) => {
  try {
    const response = await axios.get(`${api}/projects`, {
      headers: getAuthentication(),
    });
    res.json(response.data || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects data' });
  }
});

//Edit funkcija api, kad galetume keisti proektu data
app.put('/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const updatedData = req.body;
    const response = await axios.put(`${api}/projects/${projectId}`, updatedData, {
      headers: getAuthentication(),
    });

    if (response.status === 200) {
      res.json({ message: 'Project updated successfully', data: response.data });
    } else {
      res.status(400).json({ message: 'Failed to update project' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

//Delete funkcija, kad galima butu pasalinti proekta
app.delete('/projects/:id', async (req, res) => {
  const projectId = req.params.id;

  try {
    const response = await axios.delete(`${api}/projects/${projectId}`, {
      headers: getAuthentication(),
    });

    if (response.status === 200) {
      res.json({ message: 'Project deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete project' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

//Mongo back

// POST darbuotojus i MongoDB
app.post("/employees", async (req, res) => {
  try {
    const { employeeId, firstName, lastName, loginDate, position, projects } = req.body;
    let employee = await Employee.findOne({ employeeId });

    if (employee) {
      employee.position = position;
      employee.projects = projects;
      employee.firstName = firstName;
      employee.lastName = lastName;
      employee.loginDate = loginDate;
      await employee.save();
    } else {
      employee = new Employee({ employeeId, firstName, lastName, loginDate, position, projects });
      await employee.save();
    }
    res.json({ message: "Employee data saved successfully!", employee });
  } catch (error) {
    res.status(500).json({ message: "Error saving employee data", error });
  }
});

//Gauname darbuotoju data is MongoDB
app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error });
  }
});

//Jei reikia galime gauti darbuotoju data pagal ID
app.get("/employees/:employeeId", async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee", error });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
