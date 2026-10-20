import 'server-only';
import {unstable_cache} from 'next/cache';
import {getSettings} from './db';
export const cachedSettings=unstable_cache(getSettings,['hp-private-settings-v1'],{tags:['hp-settings'],revalidate:false});
