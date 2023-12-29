const { logger, restful } = require('./shared.funcs');
const { Domains } = require('./data.model');

module.exports = function domainList(req, res) {
  restful(req, res, {
    get: () => {
      const d = new Domains();
      d.getDomains().then((domains) => {
        res.status(200).json({ data: domains, error: '' });
      }).catch((err) => {
        logger.error(err);
        res.status(400).json({ data: [], error: 'DOMAINS_NOT_FOUND' });
      });
    },
  });
};
