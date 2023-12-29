const fs = require('fs');


function convertToMySQLDateTimeAndUTC(inputString) {
  // Convert the input string to a JavaScript Date object
  const inputDate = new Date(inputString);

  // Extract components
  const year = inputDate.getUTCFullYear();
  const month = ('0' + (inputDate.getUTCMonth() + 1)).slice(-2);
  const day = ('0' + inputDate.getUTCDate()).slice(-2);
  const hours = ('0' + inputDate.getUTCHours()).slice(-2);
  const minutes = ('0' + inputDate.getUTCMinutes()).slice(-2);
  const seconds = ('0' + inputDate.getUTCSeconds()).slice(-2);

  // Create a MySQL datetime string
  const mysqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return mysqlDatetime;
}

function parseCSV(csvText) {

  const sql = `INSERT INTO domains (userId,domain,insert_ts,create_ts,expire_ts,isActive,isParked,isForSale,isReserved) VALUES `;

  const rows = csvText.split('\n');
  const result = [];

  for (const row of rows) {
    if (row.trim() === '') {
      continue;
    }

    const col = row.split(',');
    result.push(
      `(1,'${col[0]}',DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),'${convertToMySQLDateTimeAndUTC(col[3])}','${convertToMySQLDateTimeAndUTC(col[1])}',1,1,1,1)`
    );
  }

  return sql + result.join(',\n');
}

// Replace 'your-file.csv' with the path to your CSV file
const filePath = 'accountDomainPrint-2023-10-29.csv';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  const parsedData = parseCSV(data);
  console.log(parsedData);
});


// const sql = `
//   INSERT INTO domains (
//     userId,
//     domain,
//     insert_ts,
//     create_ts,
//     expire_ts,
//     isActive,
//     isParked,
//     isForSale,
//     isReserved
//   ) VALUES (
//     1,
//     col[0],
//     NOW(),
//     STR_TO_DATE('${col[3]}', '%Y-%m-%d %H:%i:%s') - INTERVAL 7 HOUR,
//     STR_TO_DATE('${col[1]}', '%Y-%m-%d %H:%i:%s') - INTERVAL 7 HOUR,
//     1,
//     1,
//     1,
//     1
//   )
// `;
