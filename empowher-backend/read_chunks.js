
const fs = require('fs');
const stream = fs.createReadStream('response_comparison.txt', { encoding: 'utf8' });
stream.on('data', (chunk) => {
    console.log(chunk);
});
