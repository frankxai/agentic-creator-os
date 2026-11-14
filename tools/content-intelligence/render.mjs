import {validate} from './validate.mjs';
const xml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const wrap=(text,max=31)=>{const lines=[''];for(const word of text.split(/\s+/)){const last=lines.length-1;if((lines[last]+' '+word).trim().length>max)lines.push(word);else lines[last]=(lines[last]+' '+word).trim()}return lines};
export function renderSlide({headline,body='',index=1,total=1,brand='FrankX',channel='instagram'}){
 if(!['instagram','linkedin'].includes(channel))throw Error('unsupported_channel');
 if(!headline||headline.length>180||body.length>450)throw Error('copy_out_of_bounds');
 const w=1080,h=1350;const lines=wrap(headline,26);if(lines.length>5)throw Error('headline_overflow');
 const title=lines.map((line,i)=>'<text x="88" y="'+(345+i*89)+'" font-size="72" font-weight="700" fill="#F4F0E8">'+xml(line)+'</text>').join('');
 const desc=wrap(body,48).slice(0,8).map((line,i)=>'<text x="88" y="'+(850+i*46)+'" font-size="33" fill="#BBC8D5">'+xml(line)+'</text>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><rect width="1080" height="1350" fill="#0B1322"/><path d="M88 164 H992" stroke="#53677C" stroke-width="2"/><text x="88" y="128" fill="#D8E1E8" font-size="30" font-weight="600">'+xml(brand)+'</text><text x="992" y="128" text-anchor="end" fill="#8EA1B5" font-size="26">'+index+' / '+total+'</text>'+title+desc+'<path d="M88 1220 H992" stroke="#53677C" stroke-width="2"/><text x="88" y="1274" fill="#8EA1B5" font-size="25">SOURCE-BACKED EDITORIAL</text></svg>';
}
export function renderPackage(packet,slides,channel){
 const verdict=validate(packet);if(!verdict.ok)throw Error('invalid_packet:'+verdict.errors.join(','));
 if(!Array.isArray(slides)||slides.length<2||slides.length>10)throw Error('invalid_slide_count');
 return slides.map((slide,i)=>renderSlide({...slide,index:i+1,total:slides.length,channel,brand:packet.brand_id}));
}
