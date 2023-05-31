const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);

  if(!user){
    return response.status(404).json({erro:"username not found"});
  }

  request.user = user;
  return next();
  
}

app.post('/users', (request, response) => {

  const { name, username} = request.body;

  const usernameAlredyTaken = users.some(
    (users) => users.username === username
);

  if (usernameAlredyTaken){
    return response.status(404).json({error:"Username alredy taken"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);
  
  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;
  
  const id = uuidv4();

  const todo = {
    id: id,
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

    user.todos.push(todo);

    return  response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params

  const { title, deadline } = request.body;

  const {user} = request;

  const located = user.todos.find(task => task.id === id);

  if(!located){
    return response.status(404).json({erro:"todo not found"});
  }

  located.title = title;
  located.deadline = deadline;

  return response.status(201).json(located);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params

  const {user} = request;

  const located = user.todos.find(task => task.id === id);

  if(!located){
    return response.status(404).json({erro:"todo not found"});
  }

  located.done = true;

  return response.status(201).json(located);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params

  const {user} = request;

  const located = user.todos.find(task => task.id === id);

  if(!located){
    return response.status(404).json({erro:"todo not found"});
  }

  user.todos.splice(located, 1);

  return response.status(204).json();
});

app.listen(3333);

module.exports = app;