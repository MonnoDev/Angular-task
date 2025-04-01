const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  loginDate: {type: String, required: true},
  position: {type: String, required: true},
  projects: [
    {
      projectId: { type: String, required: true },
      inventory: [{ type: String }]
    }
  ]
});

module.exports = mongoose.model("Employee", EmployeeSchema);
