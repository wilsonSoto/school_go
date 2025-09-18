import { Subscription, fromEvent, merge, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

 export async function cleanToken(token: any) {
        let raw = token;
  try {
    // si viene como '"abc"', lo parsea a abc
    if (typeof raw === 'string' && raw.startsWith('"') && raw.endsWith('"')) {
      raw = JSON.parse(raw);
    }
  } catch (_) {}
  const cleanToken = String(raw).trim()
    .replace(/^"+|"+$/g, '')  // quita " al inicio/fin
    .replace(/^'+|'+$/g, ''); // quita ' al inicio/fin
return cleanToken

  }
