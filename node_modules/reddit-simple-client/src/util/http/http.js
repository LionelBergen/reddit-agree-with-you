import https from 'https';

const DEFAULT_USER_AGENT = 'u/dusty-trash reddit-simple-client/2.0.0 by Lionel Bergen';

function getOptions(userAgent) {
  const agent = userAgent | DEFAULT_USER_AGENT;
  const headers = { "user-agent": agent };
  const options = { headers: headers };

  return options;
}

/**
 * Run a GET request on a URL and return all the data
 *
 * @param url {string} URL to get data from
 * @param userAgent {string | DEFAULT_USER_AGENT} user agent for the http client
 * @return a promise containing data returned from the url
*/
export function getDataFromUrl(url, userAgent) {
  const options = getOptions(userAgent);

  return new Promise(function(resolve, reject) {
    https.get(url, options, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(data);
      });
    }).on("error", (err) => {
      reject('error getting data from url', err, ('url is: ' + url));
    });
  });
}
