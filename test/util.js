import Q from 'q';

export function simulateAPICall(response) {
  return function () {
    var df = Q.defer();

    setTimeout(() => {
      df.resolve({ response });
    }, 0);

    return df.promise;
  }
}
