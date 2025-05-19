import axios from 'axios';

const bearerTokens = [
  'AAAAAAAAAAAAAAAAAAAAAEcq1AEAAAAAIzOgWHOC2uc5zqlczAyq0Sk7wIY%3DREV6WvFolUAaoNruzgCLGdYcGT3bNHTqG4ETuOcEU5sLG8w50X',
  'AAAAAAAAAAAAAAAAAAAAAIsy1AEAAAAAf8R%2Bwd%2BcuLEBEOQlCTHYkjr1uVQ%3DcA4cKbOHB9Vn8N7yadoYsAgpOn5QMhPpPrzTHi7uhMsTsWKkHR',
  'AAAAAAAAAAAAAAAAAAAAAGZN1wEAAAAARUqmqWcjiMALEF4EqDO0iDlpJKo%3DFpD4MVVVS0udG9OO0z7JjcQGZsxwjfExvp1KTIzkMNXU6X3f4F',
  'AAAAAAAAAAAAAAAAAAAAAJdP1wEAAAAAB6pDAWqWDTP9ymECcL7WyjxaG%2FQ%3Dr4YrafDNvQRCXGPsJ3OvGP3bx07gqCqZVIEumsybcG2XjCBzUT',
];
const listaDeUsuarios = [
  { usuario: 'FastestPitStop', id: '1543874015206559747' },
  { usuario: 'F1', id: '69008563' }
  // ...otros usuarios comentados
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

  let fullUrl = url;
  if (method === 'GET' && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams(params);
    fullUrl = `${url}?${queryParams}`;
  }

  try {
    const axiosOptions = {
      method: method,
      url: fullUrl,
      headers: headers,
      data: body ? body : undefined,
      // 'params' is handled above via URLSearchParams for consistency with original code
    };

    if (body && method !== 'GET') {
      axiosOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(axiosOptions);
    return response.data;
  } catch (error) {
    // Axios error handling
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      console.error(`Error en la petición a ${endpoint} (Token Index: ${currentTokenIndex - 1}):`, errorData);

      if (status === 429 && retryCount < maxRetries) {
        const retryAfter = error.response.headers['retry-after'];
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

      throw new Error(`HTTP error! status: ${status} - ${JSON.stringify(errorData)}`);
    } else {
      console.error('Error al realizar la petición:', error.message);
      throw error;
    }
  }
}

async function obtenerTweetsPorKeywords(userIds, keywords, cantidadPorUsuario) {
  const endpoint = 'tweets/search/recent';
  const allTweets = [];

  for (const userId of userIds) {
    const query = `from:${userId} (${keywords.map(keyword => `"${keyword}"`).join(' OR ')})`;
    const params = {
      query: query,
      max_results: Math.min(cantidadPorUsuario, 100),
    };

    try {
      const responseData = await hacerPeticionX(endpoint, 'GET', null, params);
      if (responseData && responseData.data) {
        allTweets.push(...responseData.data);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error al obtener tweets del usuario ${userId}:`, error);
    }
    if (allTweets.length >= cantidadPorUsuario * userIds.length) {
      break;
    }
  }

  return allTweets;
}

const palabrasClaveFormula1 = ["formulaone", "formula one", "championship", "pitstop", "verstappen", "max verstappen", "perez", "sergio perez", "checo",
  "leclerc", "charles leclerc", "sainz", "carlos sainz", "hamilton", "lewis hamilton", "russell", "george russell",
  "norris", "lando norris", "piastri", "oscar piastri", "alonso", "fernando alonso", "stroll", "lance stroll"];
const cantidadDeTweetsPorUsuario = 10;
const listaDeUserIds = listaDeUsuarios.map(user => user.id);

export {
  hacerPeticionX,
  obtenerTweetsPorKeywords,
  palabrasClaveFormula1,
  cantidadDeTweetsPorUsuario,
  listaDeUserIds,
  listaDeUsuarios
};