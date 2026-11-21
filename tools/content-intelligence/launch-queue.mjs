import {createHash} from 'node:crypto';
export const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
// Evidence must be an https URL that names a host: "https://" alone is not evidence.
const httpsSource=u=>{try{const x=new URL(u);return x.protocol==='https:'&&!!x.hostname}catch{return false}};
export function prepareEdition({id,brand,source,slides,channels=['instagram','linkedin']}){
 if(!/^CI-\d{2}$/.test(id)||!['FrankX','Starlight'].includes(brand))throw Error('invalid_identity');
 if(!httpsSource(source)||!Array.isArray(slides)||slides.length<2||slides.length>10)throw Error('invalid_evidence_or_slides');
 if(Array.from({length:slides.length},(_,i)=>slides[i]).some(s=>!s?.headline||!s?.body))throw Error('incomplete_slide');
 if(channels.some(c=>!['instagram','linkedin'].includes(c)))throw Error('unsupported_channel');
 return {id,brand,source,channels,revision:sha({id,brand,source,slides,channels}),state:'REVIEW_REQUIRED',approval:null,published:false};
}
export function canExport(edition,receipt,assetHash,channel,now=Date.now()){
 if(!edition||edition.state!=='REVIEW_REQUIRED'&&edition.state!=='APPROVED_FOR_EXPORT')return false;
 if(!receipt||receipt.decision!=='APPROVE'||!receipt.reviewer||!receipt.approved_at||!receipt.expires_at)return false;
 if(typeof assetHash!=='string'||!assetHash||typeof channel!=='string'||!channel)return false;
 return receipt.revision===edition.revision&&receipt.asset_hash===assetHash&&receipt.channel===channel&&edition.channels.includes(channel)&&Date.parse(receipt.approved_at)<=now&&Date.parse(receipt.expires_at)>now;
}
export function manychatPlan({connected=false,approved=false,postId=null,keyword='AGENT'}={}){
 return {provider:'manychat',keyword,post_id:postId,enabled:Boolean(connected&&approved&&postId),publish_enabled:false,events:['comment','dm_delivery','click','consent','download'],require_opt_in:true};
}
