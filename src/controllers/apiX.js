import axios from 'axios';

const bearerTokens = [
  'AAAAAAAAAAAAAAAAAAAAAEcq1AEAAAAAIzOgWHOC2uc5zqlczAyq0Sk7wIY%3DREV6WvFolUAaoNruzgCLGdYcGT3bNHTqG4ETuOcEU5sLG8w50X',
  'AAAAAAAAAAAAAAAAAAAAAIsy1AEAAAAAf8R%2Bwd%2BcuLEBEOQlCTHYkjr1uVQ%3DcA4cKbOHB9Vn8N7yadoYsAgpOn5QMhPpPrzTHi7uhMsTsWKkHR',
  'AAAAAAAAAAAAAAAAAAAAAGZN1wEAAAAARUqmqWcjiMALEF4EqDO0iDlpJKo%3DFpD4MVVVS0udG9OO0z7JjcQGZsxwjfExvp1KTIzkMNXU6X3f4F',
  'AAAAAAAAAAAAAAAAAAAAAJdP1wEAAAAAB6pDAWqWDTP9ymECcL7WyjxaG%2FQ%3Dr4YrafDNvQRCXGPsJ3OvGP3bx07gqCqZVIEumsybcG2XjCBzUT',
];
const listaDeUsuarios = [
  { usuario: 'FastestPitStop', id: '1543874015206559747' },
  { usuario: 'F1', id: '69008563' },
  { usuario: 'SkySportsF1', id: '368276033' },
  { usuario: 'Autosport', id: '20517081' },
  { usuario: 'RaceFansDotNet', id: '13382652' },
  { usuario: 'Planet_F1', id: '23076265' },
  { usuario: 'leclercsletters', id: '1490170607354490881' },
  { usuario: 'ricnorrisf1', id: '1296464661412548610' },
  { usuario: 'RBR_Daily', id: '1426933808922730498' },
  { usuario: 'Aperta', id: '2335310932' },
  { usuario: 'FormuIaMax', id: '836637872' },
  { usuario: 'TracingInsights', id: '1503789937245581315' },
  { usuario: 'WeAreTheRace', id: '1214181376536141830' },
  { usuario: 'F1ToRuleThemAll', id: '1430636365360898052' },
  { usuario: 'Hawk9248', id: '769701355' },
  { usuario: 'EdSpencer99', id: '3363093136' },
  { usuario: 'pitpassdotcom', id: '174203958' },
  { usuario: 'AndrewBensonf1', id: '58444150' },
  { usuario: 'F1BigData', id: '1685980942223937537' },
  { usuario: 'verstappenews', id: '1593273392983056387' }
];

let currentTokenIndex = 0;

function getNextToken() {
  const token = bearerTokens[currentTokenIndex];
  currentTokenIndex = (currentTokenIndex + 1) % bearerTokens.length;
  return token;
}

async function hacerPeticionX(endpoint, method = 'GET', body = null, params = {}, retryCount = 0, maxRetries = 3) {
  const baseUrl = 'https://api.x.com/2/';
  const url = `${baseUrl}${endpoint}`;
  const currentToken = getNextToken();

  const headers = {
    'Authorization': `Bearer ${currentToken}`,
  };

  const axiosConfig = {
    method: method,
    url: url,
    headers: headers,
    params: method === 'GET' ? params : undefined,
    data: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await axios(axiosConfig);

    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data, headers } = error.response;
      console.error(`Error en la petición a ${endpoint} (Token Index: ${currentTokenIndex - 1}):`, data);

      if (status === 429 && retryCount < maxRetries) {
        const retryAfter = headers['retry-after'];
        let delay = Math.pow(2, retryCount) * 1000; // Espera exponencial por defecto
        if (retryAfter) {
          delay = parseInt(retryAfter) * 1000;
          console.log(`Recibido error 429. Reintentando con otro token en ${delay / 1000} segundos (Retry-After header)... (Intento ${retryCount + 1}/${maxRetries})`);
        } else {
          console.log(`Recibido error 429. Reintentando con otro token en ${delay / 1000} segundos... (Intento ${retryCount + 1}/${maxRetries})`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        return hacerPeticionX(endpoint, method, body, params, retryCount + 1, maxRetries);
      }

      throw new Error(`HTTP error! status: ${status} - ${JSON.stringify(data)}`);
    } else {
      console.error('Error al realizar la petición:', error.message);
      throw error;
    }
  }
}

export async function obtenerTweetsPorKeywords(keywords, cantidad) {
  const endpoint = 'tweets/search/recent';
  const query = keywords.map(keyword => `"${keyword}"`).join(' OR ');
  const params = {
    query: query,
    max_results: Math.min(cantidad, 100),
  };

  try {
    const responseData = await hacerPeticionX(endpoint, 'GET', null, params);
    return responseData && responseData.data ? responseData.data : [];
  } catch (error) {
    console.error('Error al obtener tweets por keywords:', error);
    return [];
  }
}