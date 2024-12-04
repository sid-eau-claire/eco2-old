
export type Change = {
  value: any;
  level: 'first' | 'second';
}

export type Changes = {
  [key: string]: Change;
}

export type InputObject = {
  [key: string]: any;
}

export type NestedObject = {
  [key: string]: any;
}

export type ResultObject = {
  data: NestedObject;
}

export const findChanges = (oldObj: any, newObj: any, path = '', level = 1): any => {
  const changes: any = {};
  const safeOldObj = oldObj || {};

  Object.keys(newObj).forEach((key) => {
    const fullPath = path ? `${path}.${key}` : key;

    if (level === 1) {
      // Logic for first-level changes remains the same
      if (typeof newObj[key] === 'object' && newObj[key] !== null && !(newObj[key] instanceof Array)) {
        const deeperChanges = findChanges(safeOldObj[key], newObj[key], fullPath, level + 1);
        if (Object.keys(deeperChanges).length > 0) {
          Object.assign(changes, deeperChanges);
        }
      } else if (!safeOldObj.hasOwnProperty(key) || newObj[key] !== safeOldObj[key]) {
        changes[fullPath] = newObj[key];
      }
    } else if (level === 2) {
      // For second-level changes, include the whole tree if any change is detected
      if (!safeOldObj.hasOwnProperty(key) || JSON.stringify(newObj[key]) !== JSON.stringify(safeOldObj[key])) {
        changes[path] = newObj;
        return; // Early return since the whole second-level tree will be included
      }
    }
  });

  return changes;
};


export const convertObject = (obj: InputObject): ResultObject => {
  const result: ResultObject = { data: {} };

  Object.entries(obj).forEach(([key, value]) => {
    if (key.includes('.')) {
      const [outerKey, innerKey] = key.split('.');
      result.data[outerKey] = result.data[outerKey] || {};
      result.data[outerKey][innerKey] = value;
    } else {
      result.data[key] = value;
    }
  });

  return result;
}
