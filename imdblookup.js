const request = require("request");
const util = require("util");
const Table = require('cli-table3');

const requestGetAsync = util.promisify(request.get);

async function scrapeIMDBSearch(searchTerm) {
  // https://v2.sg.media-imdb.com/suggestion/d/Das%20Phantom%20Kommando%20(1985).json
  const url = `https://v2.sg.media-imdb.com/suggestion/${searchTerm[0].toLowerCase()}/${encodeURI(
    searchTerm
  )}.json`;

  // console.log("scrapeIMDBSearch url:", url);

  const response = await requestGetAsync(url);

  let objResponse = null;

  try {
    objResponse = JSON.parse(response.body);
  } catch (err) {
    // console.error("failed parsing response body:", response.body);
  }

  const results = [];

  if (objResponse && objResponse.d && objResponse.d.length > 0) {
    objResponse.d.forEach(item => {
      results.push({
        tconst: item.id,
        title: item.l,
        titleType: item.q,
        year: item.y,
        imageURL: item.i ? item.i.imageUrl : null
      });
    });
  }

  return results;
}

console.info('imdblookup v1.0')
console.info()

const searchTerm = process.argv.slice(2)[0];

console.log('searchTerm:', searchTerm);

let showUsage = false;

if (searchTerm === '--help') {
    showUsage = true;
}

if (!searchTerm) {
    console.error('Search Term missing, abort.');
    showUsage = true;
}

if (showUsage) {
    console.info('usage: imdblookup "your search term"');
    return;
}

(async () => {
    const results = await scrapeIMDBSearch(searchTerm);



    // console.info('results:', results);

    if (!results || results.length === 0) {
        console.info('no result :(');
        return;
    }

    const table = new Table({ head: ['Type', 'Title', 'Year', 'ID', 'URL']});

    results.forEach(result => {
        table.push([
            result.titleType,
            result.title,
            result.year,
            result.tconst
        ])
    })

    console.info(table.toString());
})();