
const Database = require('./database.wrapper');
const {logger} = require('./shared.funcs');

class Login {
  #db;

  #table = 'login';

  constructor() {
    this.#db = new Database();
  }

  async getPassDetailsForComparison(email) {
    try {
      const sql = `SELECT pass, salt FROM ${this.#table} WHERE email = ? limit 1`;
      const results = await this.#db.query(sql, [email]);
      if (results.length > 0) {
        // User authenticated successfully
        return results;
      }
      // Authentication failed
      return [];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async createLogin(data) {
    try {
      const sql = `insert into ${this.#table} (create_ts, email, pass, salt, status, verified)`;
      const values = `values ('${data.create_ts}', '${data.email}', '${data.pass}', '${data.salt}', 0, 0)`;
      const results = await this.#db.query(sql + values);
      return results.insertId;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

class Users {
  #db;

  // tables
  #table = 'login';


  constructor() {
    this.#db = new Database();
  }

  async getUserExistsByEmail(email) {
    try {
      const sql = `SELECT * FROM ${this.#table} WHERE email = ? limit 1`;
      const results = await this.#db.query(sql, [email]);
      if (results.length > 0) {
        return true;
      }
      return false;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

class Domains {
  #db;
  #table = 'domains';

  constructor() {
    this.#db = new Database();
  }

  async getDomains() {
    try {
      const sql = `
        SELECT
          id,
          domain as name,
          TIMESTAMPDIFF(YEAR, create_ts, NOW()) as age,
          FORMAT(TIMESTAMPDIFF(DAY, NOW(), expire_ts), 0) as days_left,
          DATE_FORMAT(create_ts, '%Y-%m-%d') as create_ts,
          DATE_FORMAT(expire_ts, '%Y-%m-%d') as expire_ts,
          DATE_FORMAT(insert_ts, '%Y-%m-%d') as insert_ts,
          isParked,
          isForSale,
          isReserved,
          SUBSTRING_INDEX( domain, '.', -1) as domain_tld,
          LENGTH(SUBSTRING_INDEX( domain, '.', 1)) as domain_length
        FROM ${this.#table} WHERE isActive = 1 ORDER BY domain ASC
        `;
      const domains = await this.#db.query(sql);

      const tlds = await this.getDomainTLDs().then((tlds) => {
        return tlds || [];
      });

      if (domains.length > 0) {
        return {domains: domains, tlds: tlds};
      }

      return [];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getDomainTLDs() {
    try {
      const sql = `
        SELECT
        SUBSTRING_INDEX( domain, '.', -1) as tld
        FROM ${this.#table} WHERE isActive = 1 GROUP BY tld ORDER BY tld ASC
        `;
      const results = await this.#db.query(sql);
      if (results.length > 0) {
        return results.map((r) => r.tld);
      }
      return [];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

class Messages {
  #db;
  #table = 'messages';

  constructor() {
    this.#db = new Database();
  }

  async getUnreadCount() {
    try {
      const sql = `SELECT COUNT(*) as count FROM ${this.#table} WHERE isRead = 0`;
      const results = await this.#db.query(sql);
      if (results.length > 0) {
        return results[0].count;
      }
      return 0;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getMessages() {
    try {
      const sql = `
        SELECT
          id,
          isRead,
          TIMESTAMPDIFF(YEAR, create_ts, NOW()) as age,
          DATE_FORMAT(create_ts, '%Y-%m-%d') as create_ts
          fullname,
          LEFT(message, 30) as message,
          message_type,
          other,
        FROM ${this.#table} ORDER BY create_ts DESC
        `;
      const messages = await this.#db.query(sql);

      if (messages.length > 0) {
        return messages;
      }

      return [];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getSingleMessage(id) {
    try {
      const sql = `
        SELECT
        id,
        isRead,
        TIMESTAMPDIFF(YEAR, create_ts, NOW()) as age,
        DATE_FORMAT(create_ts, '%Y-%m-%d') as create_ts
        email,
        fullname,
        message,
        message_type,
        other,
        DATE_FORMAT(read_ts, '%Y-%m-%d') as read_ts
        FROM ${this.#table} WHERE isActive = 1 AND id = ? LIMIT 1
        `;
      const messages = await this.#db.query(sql, [id]);

      if (messages.length > 0) {
        await this.markMessageAsRead(id);
        return messages;
      }

      return [];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async saveMessage(data) {
    try {
      const sql = `insert into messages (isRead, email, fullname, message, other, message_type, create_ts)`;
      const values = `values (
        0,
        '${data.email}',
        '${data.fullname}',
        '${data.message}',
        '${data.other}',
        '${data.message_type}',
        DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
      )`;
      const results = await this.#db.query(sql + values);
      return results.insertId;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async markMessageAsRead(id) {
    try {
      const sql = `update messages set isRead = 1, read_ts = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') where id = ?`;
      const results = await this.#db.query(sql, [id]);
      return results.affectedRows;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

module.exports = {
  Domains,
  Login,
  Messages,
  Users
};

