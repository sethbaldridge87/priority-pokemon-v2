globalThis.__timing__.logStart('Load chunks/routes/api/collection.get');import { d as defineEventHandler, s as setResponseHeader } from '../../_/nitro.mjs';
import { r as readCollection, g as getVisitorId } from '../../_/visitor.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@upstash/redis';

const collection_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");
  return { pokemonCollection: await readCollection(getVisitorId(event)) };
});

export { collection_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/collection.get');
//# sourceMappingURL=collection.get.mjs.map
