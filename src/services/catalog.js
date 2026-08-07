function svgData(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const pearlDrop = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="360" viewBox="0 0 240 360"><defs><radialGradient id="p" cx="35%" cy="25%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f7ecd1"/><stop offset="1" stop-color="#d5b875"/></radialGradient><filter id="s"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".35"/></filter></defs><g filter="url(#s)"><circle cx="120" cy="48" r="30" fill="url(#p)"/><path d="M120 78 C102 132 54 164 54 236 C54 298 86 336 120 336 C154 336 186 298 186 236 C186 164 138 132 120 78Z" fill="url(#p)" stroke="#f7d774" stroke-width="8"/></g></svg>`);
const goldHoop = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="320" viewBox="0 0 260 320"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#b7791f"/><stop offset=".5" stop-color="#ffe58a"/><stop offset="1" stop-color="#b7791f"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".38"/></filter></defs><ellipse cx="130" cy="160" rx="84" ry="122" fill="none" stroke="url(#g)" stroke-width="34" filter="url(#s)"/><circle cx="130" cy="34" r="22" fill="url(#g)"/></svg>`);
const diamondStud = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260"><defs><linearGradient id="d" x1="0" x2="1"><stop stop-color="#dff7ff"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#a8d8ff"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".35"/></filter></defs><path d="M130 22 226 104 130 238 34 104Z" fill="url(#d)" stroke="#d9f2ff" stroke-width="10" filter="url(#s)"/><path d="M34 104h192M82 104l48 134 48-134M82 104l48-82 48 82" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="8"/></svg>`);
const goldPendant = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="420" viewBox="0 0 760 420"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#a86e12"/><stop offset=".5" stop-color="#ffe58a"/><stop offset="1" stop-color="#a86e12"/></linearGradient><radialGradient id="r"><stop stop-color="#fff2a8"/><stop offset="1" stop-color="#c18422"/></radialGradient><filter id="s"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-opacity=".35"/></filter></defs><path d="M70 70 C210 330 550 330 690 70" fill="none" stroke="url(#g)" stroke-width="30" stroke-linecap="round" filter="url(#s)"/><circle cx="380" cy="292" r="58" fill="url(#r)" stroke="#fff2a8" stroke-width="10" filter="url(#s)"/><path d="M380 240 412 292 380 345 348 292Z" fill="#fff6bf" opacity=".7"/></svg>`);
const pearlStrand = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="400" viewBox="0 0 760 400"><defs><radialGradient id="p"><stop stop-color="#fff"/><stop offset=".65" stop-color="#f4ebcf"/><stop offset="1" stop-color="#caa95f"/></radialGradient><filter id="s"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".28"/></filter></defs><g filter="url(#s)">` + Array.from({length:21},(_,i)=>{const t=i/20; const x=70+t*620; const y=66+210*Math.sin(Math.PI*t); const r=18+12*Math.sin(Math.PI*t); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#p)"/>`;}).join('') + `</g></svg>`);

export const catalog = [
  { id: 'ear-pearl-drop', name: 'Pearl Drop', category: 'earrings', price: 2499, image: pearlDrop },
  { id: 'ear-gold-hoop', name: 'Gold Hoop', category: 'earrings', price: 3199, image: goldHoop },
  { id: 'ear-diamond-stud', name: 'Diamond Stud', category: 'earrings', price: 4599, image: diamondStud },
  { id: 'neck-gold-pendant', name: 'Gold Pendant', category: 'necklace', price: 8999, image: goldPendant },
  { id: 'neck-pearl-strand', name: 'Pearl Strand', category: 'necklace', price: 7299, image: pearlStrand }
];

export function getProduct(id) {
  return catalog.find(p => p.id === id);
}
