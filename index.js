/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

morgan.token('body', (req) => JSON.stringify(req.body));

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

const generateId = () => {
  const rand = Math.ceil(Math.random() * 10000);
  return rand;
};

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    const info = `Phonebook has info for ${
      persons.length
    } people<br /><br />${new Date()}`;
    response.send(info);
  });
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' });
  }

  return Person.find({ name: body.name }).then((persons) => {
    if (persons.length) {
      return response
        .status(400)
        .json({ error: 'name already exists in phonebook' });
    }
    const person = new Person({
      id: generateId(),
      name: body.name,
      number: body.number,
    });

    return person
      .save()
      .then((p) => {
        response.json(p);
      })
      .catch((error) => next(error));
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  return next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
