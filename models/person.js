/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable operator-linebreak */
/* eslint-disable no-console */
const mongoose = require('mongoose');

// const url = `mongodb+srv://sami:bHUVFcb08xqDGnOc@cluster0.pbozx.mongodb.net/phonebookApp?retryWrites=true&w=majority`;
const url = process.env.MONGO_DB_URI;
mongoose.connect(url).then(() => {
  console.log('CONNECTED');
});

const isValidPhoneNumber = (number) => {
  const numberParts = number.split('-');
  if (numberParts.length > 2) return false;
  if (
    numberParts.length === 2 &&
    numberParts[0].length !== 2 &&
    numberParts[0].length !== 3
  ) {
    return false;
  }
  let valid = true;
  numberParts.forEach((numPart) => {
    if (!Number(numPart)) {
      valid = false;
    }
  });
  if (!valid) return false;
  const noOfDigits = numberParts.reduce(
    (previousValue, currentValue) => previousValue + currentValue.length,
    0,
  );
  if (noOfDigits < 8) return false;
  return true;
};

const personSchema = mongoose.Schema({
  name: { type: String, minLength: 3 },
  number: { type: String, validate: { validator: isValidPhoneNumber } },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
