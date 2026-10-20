import {neon} from '@neondatabase/serverless';
import {seedMedia} from '../src/data/seed';
async function main(){
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required.');
const sql=neon(process.env.DATABASE_URL);
// Preserve descriptions and crops that staff already edited. Backfill only file facts.
const result=await sql.query(`UPDATE hp_records AS record SET data=record.data||jsonb_build_object('size',asset->'size','type',asset->'type') FROM jsonb_array_elements($1::jsonb) asset WHERE record.collection='media' AND record.data->>'url'=asset->>'url' RETURNING record.id`,[JSON.stringify(seedMedia)]);
console.log(`Updated file metadata for ${result.length} imported assets in one query.`);
}
main().catch(error=>{console.error(error.name);process.exitCode=1;});
