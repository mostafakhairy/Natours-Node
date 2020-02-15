const fs = require('fs');
module.exports = class Helper {
  static readFilePromise(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }
  static writeFilePromise(path, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, (error, res) => {
        if (error) {
          reject(error);
        }
        resolve(res);
      });
    });
  }
};
