const customApi = async (endpoint, params = {}) => {
  
  const baseUrl = `${process.env.TMDB_API_URL}/${endpoint}`;
  const query = new URLSearchParams({
    ...params, 
    language: params.language || 'en-US',
  });

  const url = `${baseUrl}?${query}`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.API_read_access_token}`,
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from TMDB API: ${error.message}`);
    throw error;
  }
};

module.exports = customApi;
