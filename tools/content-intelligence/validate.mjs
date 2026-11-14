import {createHash} from 'node:crypto';
export const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function validate(p){
 const errors=[];
 if(!p?.content_id||!p.brand_id||!p.thesis)errors.push('identity');
 if(!p?.sources?.length)errors.push('sources');
 const ids=new Set();
 for(const s of p?.sources||[]){
  if(!s.id||ids.has(s.id))errors.push('source_id');ids.add(s.id);
  try{const u=new URL(s.url);if(u.protocol!=='https:'||u.username||u.password||/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/i.test(u.hostname))errors.push('unsafe_url')}catch{errors.push('unsafe_url')}
  if(!s.retrieved_at||!s.rights)errors.push('provenance');
 }
 if(!p?.claims?.length)errors.push('claims');
 for(const c of p?.claims||[])if(!c.text||!c.evidence||!ids.has(c.source_id))errors.push('unsupported_claim');
 return {ok:!errors.length,errors:[...new Set(errors)]};
}
export function approved(p,asset,a,now=Date.now()){
 if(!validate(p).ok||!asset||!a||a.decision!=='approved'||!a.reviewer_id)return false;
 if(a.content_hash!==digest(p)||a.asset_hash!==asset.hash||a.channel!==asset.channel)return false;
 const start=Date.parse(a.approved_at),end=Date.parse(a.expires_at);
 return Number.isFinite(start)&&Number.isFinite(end)&&start<=now&&end>now;
}
export function usage({provider,model,input_tokens,output_tokens,input_rate,output_rate,budget}){
 if(!provider||!model||![input_tokens,output_tokens,input_rate,output_rate,budget].every(n=>Number.isFinite(n)&&n>=0))throw Error('invalid_usage');
 const estimated_usd=(input_tokens*input_rate+output_tokens*output_rate)/1e6;
 return {provider,model,input_tokens,output_tokens,estimated_usd,billed_usd:null,budget_exceeded:estimated_usd>budget};
}
export const exportDecision=(p,asset,a)=>({export_allowed:approved(p,asset,a),publish_allowed:false});
