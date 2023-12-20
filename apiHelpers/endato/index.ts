import { logger } from "../../utils/logger";

import { cache } from "../../utils/cache";

import fetch, { Headers } from "node-fetch";

/**
 * Use the endato api to collect public information using a phone number.
 * @param phoneNumber A phone number in the structure 000-000-0000 . International phone numbers outside the US aren't allowed so +1 is automatically assumed as the country code.
 * @param city The city of the person residing in the US
 * @param state The state of the person residing in the US
 * @returns
 */
export const personLookup = async (phoneNumber: string, city: string, state: string) => {
  /**
   * For US based numbers remove the +1
   */
  let strippedPhoneNumber = (phoneNumber + "").replace("+1", "");

  /**
   * Attempt to find the result if the lookup has been cached
   */
  let cachedResult = cache.getSync(strippedPhoneNumber);

  if (cachedResult) {
    logger.info(strippedPhoneNumber + " found in cache");
    return JSON.parse(cachedResult);
  }

  /**
   * Send a request to Endato to find the person assocciated
   * with the phone number.
   */

  const headers = new Headers();

  headers.set("accept", "application/json");
  headers.set("galaxy-ap-name", process.env.ENDATO_API_KEY_NAME!);
  headers.set("galaxy-ap-password", process.env.ENDATO_API_KEY_PASSWORD!);
  headers.set("galaxy-search-type", "Person");
  headers.set("content-type", "application/json");

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({
      Phone: strippedPhoneNumber,
      City: city,
      State: state,
    }),
  };

  let data = await fetch("https://devapi.endato.com/PersonSearch", options)
    .then((response) => response.json())
    .then((response) => response)
    .catch((err) => {
      logger.error("Failed to get data on phone number " + err);
    });

  /**
   * Cache the result of the lookup
   */

  logger.info("Caching result for " + strippedPhoneNumber);
  cache.setSync(strippedPhoneNumber, JSON.stringify(data));

  return data;
};
