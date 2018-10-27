import fetch from 'node-fetch';
import url from 'url';

export async function makeRequest(api, endpoint, opts, method = 'POST') {
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    const credentials = 'same-origin';
    const body = JSON.stringify(opts);
    const apiUrl = url.resolve(api, endpoint);
    try {
        const res = await fetch(apiUrl, { method, headers, credentials, body });
        return await res.json();
    }
    catch(err) {
        console.log(`Error fetching data from API: ${api}`)
    }
}

export async function getSimilarity(api, model, text1, text2) {
    const json = await makeRequest(api, '/similarity', { model, text1, text2 });
    return json.similarity;
}
