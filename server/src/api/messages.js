const express = require('express');
const Joi = require('joi');

const db = require('../db');
const messages = db.get('theMapDB');

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(500).required(),
  message: Joi.string().alphanum().min(1).max(100).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const router = express.Router();

router.get('/', (req, res) => {
  messages
  .find()
  .then(allMessages => {
    res.json(allMessages);
  })
});

router.post('/', (req, res, next) => {
  const result = schema.validate(req.body);
  if (result.error === null) {
    const { name, message, latitude, longitude } = req.body;
    const userMessage = {
      name,
      message,
      latitude,
      longitude
    };
    //add current server time
    // insert into DB
    messages
      .insert(userMessage)
      .then(insertedMessage => {
        res.json(insertedMessage);
      });
  } else {
    next(result.error);
  }
});

module.exports = router;
