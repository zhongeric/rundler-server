const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample data
let tasks = [
  { id: 1, name: 'Build API', completed: false },
  { id: 2, name: 'Create Documentation', completed: true }
];

// GET endpoint - fetch all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// GET endpoint - fetch a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(task => task.id === id);
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  res.json(task);
});

// POST endpoint - create a new task
app.post('/api/tasks', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Task name is required' });
  }
  
  const newId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
  const newTask = { id: newId, name, completed: false };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});