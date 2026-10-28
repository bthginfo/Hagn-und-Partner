import 'server-only';
import {unstable_cache} from 'next/cache';
import {databaseCacheNamespace,getSettings} from './db';
export const cachedSettings=unstable_cache(getSettings,['hp-private-settings-v2',databaseCacheNamespace],{tags:['hp-settings'],revalidate:false});
