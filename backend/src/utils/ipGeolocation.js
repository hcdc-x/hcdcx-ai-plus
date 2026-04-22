const axios = require('axios');
const logger = require('./logger');

// Cache for IP lookups to avoid rate limits
const ipCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get geolocation data from IP address
 * Uses free ip-api.com service
 * @param {string} ip - IP address
 * @returns {Promise<Object>} Location data
 */
const getGeoLocation = async (ip) => {
  // Skip local/private IPs
  if (isPrivateIP(ip) || ip === '::1' || ip === '127.0.0.1') {
    return {
      country: 'Local',
      countryCode: 'LO',
      region: 'Local',
      city: 'Development',
      lat: null,
      lng: null,
    };
  }

  // Check cache
  const cached = ipCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      params: {
        fields: 'status,message,country,countryCode,region,regionName,city,lat,lon',
      },
      timeout: 3000,
    });

    if (response.data.status === 'success') {
      const location = {
        country: response.data.country,
        countryCode: response.data.countryCode,
        region: response.data.region,
        regionName: response.data.regionName,
        city: response.data.city,
        lat: response.data.lat,
        lng: response.data.lon,
      };

      // Cache result
      ipCache.set(ip, {
        data: location,
        timestamp: Date.now(),
      });

      return location;
    }

    logger.debug(`IP API failed for ${ip}: ${response.data.message}`);
  } catch (error) {
    logger.debug(`IP geolocation error for ${ip}: ${error.message}`);
  }

  // Return default on failure
  return {
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown',
    lat: null,
    lng: null,
  };
};

/**
 * Check if IP is private/local
 * @param {string} ip - IP address
 * @returns {boolean}
 */
const isPrivateIP = (ip) => {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  // Check private ranges
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;

  return false;
};

/**
 * Clear expired cache entries
 */
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of ipCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      ipCache.delete(key);
    }
  }
};

// Clean cache every hour
setInterval(cleanCache, CACHE_TTL);

module.exports = {
  getGeoLocation,
  isPrivateIP,
};
