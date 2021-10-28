import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDatabase, getUserCollection } from './utils/database';

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

app.get('/api/users', async (_request, response) => {
  const userCollection = getUserCollection();
  const cursor = userCollection.find();
  const allUsers = await cursor.toArray();
  response.status(200).send(allUsers);
});

app.get('/api/users/:username', async (request, response) => {
  const userCollection = getUserCollection();
  const user = request.params.username;
  const userRequest = await userCollection.findOne({
    username: user,
  });
  if (!userRequest) {
    response.status(404).send('Name is unknown');
  } else {
    response.send(userRequest);
  }
});

app.delete('/api/users/:username', async (request, response) => {
  const userCollection = getUserCollection();
  const user = request.params.username;
  const findName = await userCollection.findOne({
    username: user,
  });
  if (findName) {
    await userCollection.deleteOne({ username: user });
    response.send(`User ${user}  deleted`);
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
    const userDocument = await userCollection.insertOne(newUser);
    const responseDocument = { ...newUser, ...userDocument.insertedId };
    response.status(200).send(responseDocument);
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
