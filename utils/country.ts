export async function getCountry() {
  let country: string | null = null;

  await getCountryFromIpApi()
    .then((countryCode) => {
      country = countryCode;
    })
    .catch(async () => {
      await getCountryFromIpApiCo()
        .then((countryCode) => {
          country = countryCode;
        })
        .catch(async () => {
          await getCountryFromIp2c().then((countryCode) => {
            country = countryCode;
          });
        });
    });

  if (!country) {
    throw new Error("Country not found");
  }

  return country;
}

export function getCountryFromIpApi() {
  return fetch("http://ip-api.com/json")
    .then((response) => response.json())
    .then((response) => {
      return response.countryCode;
    });
}

export function getCountryFromIpApiCo() {
  return fetch("https://ipapi.co/json")
    .then((response) => response.json())
    .then((response) => {
      return response.country_code;
    });
}

export function getCountryFromIp2c() {
  return fetch("https://ip2c.org/s")
    .then((response) => response.text())
    .then((response) => {
      const result = (response || "").toString();

      if (!result || result[0] !== "1") {
        throw new Error("unable to fetch the country");
      }

      return result.substr(2, 2);
    });
}
