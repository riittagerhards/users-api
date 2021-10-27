import express from 'express';

const app = express();
const port = 3000;

//for parcing application/json
app.use(express.json());

const users = [
  {
    name: 'Mickey',
    username: 'mickeym',
    password: 'mouse',
  },
  {
    name: 'Minnie',
    username: 'minniem',
    password: 'ladymouse',
  },
  {
    name: 'Donald',
    username: 'donaldd',
    password: 'duck',
  },
  {
    name: 'Daisy',
    username: 'daisyd',
    password: 'ladyduck',
  },
  {
    name: 'Goofy',
    username: 'goofy9000',
    password: '123abc',
  },
];

app.get('/api/users', (_request, response) => {
  response.send(users);
});

app.get('/api/users/:username', (request, response) => {
  const user = users.find((user) => user.username === request.params.username);
  if (user) {
    response.send(user);
  } else {
    response.status(404).send('Name is unknown');
  }
});

app.delete('/api/users/:username', (request, response) => {
  const isNameKnown = users.some(
    (user) => user.username === request.params.username
  );
  if (isNameKnown) {
    const deleteUser = users.findIndex(
      (user) => user.username === request.params.username
    );
    users.splice(deleteUser, 1);
    response.send('User deleted');
  } else {
    response.status(404).send('Name is unknown');
  }
});

app.post('/api/users', (request, response) => {
  const newUser = request.body;
  if (
    typeof newUser.name !== 'string' ||
    typeof newUser.username !== 'string' ||
    typeof newUser.password !== 'string'
  ) {
    response.status(400).send('Missing properties');
    return;
  }
  if (users.some((user) => user.username === newUser.username)) {
    response.status(409).send('You cannot add the same user twice');
  } else {
    users.push(newUser);
    response.send(`${newUser.name} added`);
  }
});

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
