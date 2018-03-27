export function status(response) {
  if (response.status >= 200 && response.status < 400) {
    return response.json();
  }
  
  throw response;
}

export function parseError(error) {
  if (!(error instanceof Error))
    return new Promise((resolve, reject) => reject(error.json()))
}
