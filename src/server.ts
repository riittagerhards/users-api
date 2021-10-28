import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './utils/database';
import { getUserCollection } from './utils/database';

if (!process.env.MONGODB_URI) {
  throw new Error('No MongoDB URI dotenv variable');
}

const app = express();
const port = 3000;

//for parcing application/json
app.use(express.json());

//Middleware for parsing cookies
app.use(cookieParser());

const users = [
  { name: 'Mickey', username: 'mickeym', password: 'mouse' },
  { name: 'Minnie', username: 'minniem', password: 'ladymouse' },
  { name: 'Donald', username: 'donaldd', password: 'duck' },
  { name: 'Daisy', username: 'daisyd', password: 'ladyduck' },
  { name: 'Goofy', username: 'goofy9000', password: '123abc' },
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

app.post('/api/users', async (request, response) => {
  const newUser = request.body;
  if (
    typeof newUser.name !== 'string' ||
    typeof newUser.username !== 'string' ||
    typeof newUser.password !== 'string'
  ) {
    response.status(400).send('Missing properties');
    return;
  }
  const userCollection = getUserCollection();
  const existingUser = await userCollection.findOne({
    username: newUser.username,
  });
  if (!existingUser) {
    const insertedUser = await userCollection.insertOne(newUser);
    response.send(`${newUser.name} added, with ID: ${insertedUser.insertedId}`);
  } else {
    response.status(409).send('You cannot add a user twice');
  }
});

app.post('/api/login', (request, response) => {
  const logInUser = request.body;
  const user = users.find(
    (user) =>
      user.username === logInUser.username &&
      user.password === logInUser.password
  );
  if (user) {
    response.setHeader('Set-Cookie', `username=${user.username}`);
    response.status(202).send('Login successful');
  } else {
    response.status(404).send('User unknown');
  }
});

app.get('/api/me', (request, response) => {
  const username = request.cookies.username;
  const foundUser = users.find((user) => user.username === username);
  if (foundUser) {
    response.send(foundUser);
  } else {
    response.status(404).send('User not found');
  }
});

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
