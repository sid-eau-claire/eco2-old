export const normalize = (data) => {
  const isObject = (data) =>
    Object.prototype.toString.call(data) === '[object Object]';
  const isArray = (data) =>
    Object.prototype.toString.call(data) === '[object Array]';

  const flatten = (data) => {
    if (!data.attributes) return data;

    // Destructure to omit createdAt, updatedAt, and publishedAt fields
    // const { createdAt, updatedAt, publishedAt, ...restAttributes } = data.attributes;
    const { publishedAt, ...restAttributes } = data.attributes;

    return {
      id: data.id,
      ...restAttributes,
    };
  };
  if (isArray(data)) {
    return data.map((item) => normalize(item));
  }
  if (isObject(data)) {
    if (isArray(data.data)) {
      data = [...data.data];
    } else if (isObject(data.data)) {
      data = flatten({ ...data.data });
    } else if (data.data === null) {
      data = null;
    } else {
      data = flatten(data);
    }

    for (const key in data) {
      data[key] = normalize(data[key]);
    }
    return data;
  }
  return data;
};

export const normalizeWithDate = (data) => {
  const isObject = (data) =>
    Object.prototype.toString.call(data) === '[object Object]';
  const isArray = (data) =>
    Object.prototype.toString.call(data) === '[object Array]';

  const flatten = (data) => {
    if (!data.attributes) return data;

    // Destructure to omit createdAt, updatedAt, and publishedAt fields
    // const { createdAt, updatedAt, publishedAt, ...restAttributes } = data.attributes;

    return {
      id: data.id,
      ...data.attributes,
    };
  };
  if (isArray(data)) {
    return data.map((item) => normalize(item));
  }
  if (isObject(data)) {
    if (isArray(data.data)) {
      data = [...data.data];
    } else if (isObject(data.data)) {
      data = flatten({ ...data.data });
    } else if (data.data === null) {
      data = null;
    } else {
      data = flatten(data);
    }

    for (const key in data) {
      data[key] = normalize(data[key]);
    }
    return data;
  }
  return data;
};

export const denormalize = (data) => {
  const isObject = (obj) =>
    obj && typeof obj === 'object' && !Array.isArray(obj);

  const wrapAttributes = (obj) => {
    const { id, ...rest } = obj;
    return {
      id,
      attributes: { ...rest },
    };
  };

  const denormalizeData = (data) => {
    if (Array.isArray(data)) {
      return { data: data.map((item) => denormalizeData(item)) };
    } else if (isObject(data)) {
      const wrapped = wrapAttributes(data);
      for (const key in wrapped.attributes) {
        wrapped.attributes[key] = denormalizeData(wrapped.attributes[key]);
      }
      return wrapped;
    }
    return data;
  };

  return denormalizeData(data);
};

// export const formatCurrency = (value) => {
//   // Check if value is not null or undefined
//   if (value !== null && value !== undefined) {
//     // Using the Canadian locale; adjust if needed for different regions within Canada
//     const formattedValue = new Intl.NumberFormat('en-CA', {
//       style: 'currency',
//       currency: 'CAD',
//       minimumFractionDigits: 2, // Ensures two decimal places
//       maximumFractionDigits: 2, // Maximum two decimal places
//     }).format(value);

//     return formattedValue;
//   } else {
//     return 'N/A';
//   }
// }

export const formatCurrency = (value, useShortForm = false) => {
  // Check if value is not null or undefined
  if (value !== null && value !== undefined) {
    // Handle short form logic if useShortForm is true
    if (useShortForm) {
      if (value >= 1000000) {
        // For values over 1 million, format as 1.xM
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 10000) {
        // For values over 10,000, format as 10.xK
        return `${(value / 1000).toFixed(1)}K`;
      }
    }

    // Default full format if not using short form
    const formattedValue = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2, // Ensures two decimal places
      maximumFractionDigits: 2, // Maximum two decimal places
    }).format(value);

    return formattedValue;
  } else {
    return 'N/A';
  }
};


export const currencyToNumber = (currencyStr) => {
  // Validate that the input is indeed a string
  if (typeof currencyStr !== 'string') {
      return null;
  }

  // Remove the currency symbol ($) and commas from the string
  const numericStr = currencyStr.replace(/[$,]/g, '');

  // Convert the cleaned string to a number
  const number = parseFloat(numericStr);

  // Ensure that the conversion results in a finite number
  if (isFinite(number)) {
      return number;
  } else {
      return null;
  }
}