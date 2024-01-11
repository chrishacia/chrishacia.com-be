const validator = require('email-validator');
const { Messages } = require('./data.model');
const { logger, restful } = require('./shared.funcs');

const msgs = new Messages();

module.exports = function messagesHandler(req, res) {
  restful(req, res, {
    post: () => {
      const { email, message, message_type, name } = req.body;
      let other = '';

      if(!email) {
        res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
        return;
      }
      if(!validator.validate(email)) {
        res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
        return;
      }
      if(!message) {
        res.status(400).json({ data: [], error: 'MESSAGE_EMPTY' });
        return;
      }
      if(!message_type) {
        res.status(400).json({ data: [], error: 'MESSAGE_TYPE_EMPTY' });
        return;
      }
      if(!name) {
        res.status(400).json({ data: [], error: 'NAME_EMPTY' });
        return;
      }

      const data = {
        email,
        fullname: name,
        message: message,
        message_type,
        other,
      };

      msgs.saveMessage(data).then((id) => {
        res.status(200).json({ data: id, error: '' });
      }).catch((err) => {
        logger.error(err);
        res.status(400).json({ data: [], error: 'MESSAGE_SAVE_FAILED' });
      });

    }, 
    get: () => {},
    put: () => {}
  });
}