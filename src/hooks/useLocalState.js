import { useEffect, useState } from 'react';
import { loadJson, saveJson } from '../services/storage.js';

export function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => loadJson(key, initialValue));
  useEffect(() => saveJson(key, value), [key, value]);
  return [value, setValue];
}
