const { workerData } = require('worker_threads');
const request = require('superagent');

const { url, workerNumber, daysToRequest } = workerData;

(async function sendRequests() {
  for (let i = 1; i < daysToRequest.length; i++) {
    try {
      const result = await request
        .post(`${url}/reservation`)
        .send({
          fullName: `fn${workerNumber}`,
          email: `e${workerNumber}@ma.il`,
          arrival: daysToRequest[i - 1],
          departure: daysToRequest[i],
        });

      if (result.statusCode === 201) {
        // This is a bit of an ugly hack, but since the number of
        // available reservations is so small (one month), adding a
        // back-off ensures that the first thread that makes requests
        // doesn't get them all.  The end result is there appears to
        // be genuine competition for the reservations, with varying
        // results.
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } catch (_) {}
  }
})();
