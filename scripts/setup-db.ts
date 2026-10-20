import { setupDatabase, getState, cleanupExpiredSecurityRecords } from '../src/lib/db';
import { authConfig } from '../src/lib/auth';
import { websiteSchema } from '../src/lib/validation';
import {seedContent} from '../src/data/seed';
async function main(){websiteSchema.parse(seedContent);await setupDatabase();await authConfig();await cleanupExpiredSecurityRecords();const state=await getState();console.log(`Database ready: ${state.published.pages.length} published pages, revision ${state.revision}.`);}
main().catch(error=>{console.error(error.name,error.message);process.exitCode=1;});
