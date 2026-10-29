// Meslektaş'ın kendi çizimleri (telif bize ait). Her çizim 160x140 alanda.
// Yeni çizim = buraya bir fonksiyon + CIZIMLER listesine bir satır.
import React from 'react';
import Svg, { Path, Rect, Ellipse, Circle, G, Text as SvgText } from 'react-native-svg';

const CELIK = '#b8bcc2', CELIK_ACIK = '#d9dde2', CELIK_KOYU = '#8f949b', GOLGE = '#e3d6c3', KAHVE = '#6b4a35', KOYU = '#2a211b';

const Golge = ({ cx = 80, cy = 128, rx = 60 }) => <Ellipse cx={cx} cy={cy} rx={rx} ry={7} fill={GOLGE} />;

const Portafiltre = () => (<G>
  <Golge />
  <Path d="M103 82 L151 60 Q159 57 161 64 Q163 71 155 74 L109 94 Z" fill="#3b2418" />
  <Path d="M108 86 L153 66" stroke="#5a3826" strokeWidth="2" fill="none" />
  <Path d="M27 80 L109 80 L105 102 Q101 116 68 116 Q35 116 31 102 Z" fill={CELIK} />
  <Path d="M27 80 L109 80 L107 88 L29 88 Z" fill={CELIK_ACIK} />
  <Ellipse cx="68" cy="80" rx="41" ry="9" fill="#e8ebee" />
  <Ellipse cx="68" cy="80" rx="34" ry="6.5" fill={KAHVE} />
  <Path d="M55 116 L57 124 L79 124 L81 116 Z" fill={CELIK_KOYU} />
  <Rect x="21" y="78" width="10" height="5" rx="2" fill={CELIK_KOYU} /><Rect x="105" y="78" width="10" height="5" rx="2" fill={CELIK_KOYU} />
</G>);

const Tamper = () => (<G>
  <Golge rx={48} />
  <Path d="M64 22 Q60 20 60 28 L60 74 Q60 80 68 80 L92 80 Q100 80 100 74 L100 28 Q100 20 96 22 Q80 16 64 22 Z" fill="#c8553d" />
  <Path d="M68 28 L68 72" stroke="#e07a62" strokeWidth="4" strokeLinecap="round" />
  <Rect x="74" y="80" width="12" height="14" fill={CELIK_KOYU} />
  <Path d="M46 94 L114 94 L114 108 Q114 114 108 114 L52 114 Q46 114 46 108 Z" fill={CELIK} />
  <Rect x="46" y="94" width="68" height="5" fill={CELIK_ACIK} />
</G>);

const SutPotu = () => (<G>
  <Golge rx={52} />
  <Path d="M50 30 L108 30 L114 116 Q114 122 108 122 L54 122 Q48 122 48 116 Z" fill="#c4c8cd" />
  <Path d="M50 30 L108 30 L109 44 L49 44 Z" fill="#dfe2e6" />
  <Path d="M48 30 Q36 28 30 20 L42 18 Q46 26 52 28 Z" fill={CELIK} />
  <Path d="M114 50 Q136 52 136 74 Q136 96 114 94" stroke="#9aa0a7" strokeWidth="7" fill="none" strokeLinecap="round" />
  <Path d="M60 44 L62 112" stroke="#eef0f2" strokeWidth="5" strokeLinecap="round" />
  <Ellipse cx="79" cy="32" rx="28" ry="5" fill="#fffaf2" />
</G>);

const Terazi = () => (<G>
  <Golge rx={62} />
  <Rect x="24" y="82" width="112" height="42" rx="8" fill={KOYU} />
  <Rect x="30" y="72" width="100" height="14" rx="5" fill="#4a3f38" />
  <Rect x="42" y="92" width="58" height="22" rx="4" fill="#9fd3b4" />
  <SvgText x="71" y="108" fontSize="13" fontWeight="bold" fill="#14452f" textAnchor="middle">36.0 g</SvgText>
  <Circle cx="118" cy="103" r="7" fill="#c8553d" />
  <Path d="M56 72 L60 42 Q61 36 68 36 L92 36 Q99 36 100 42 L104 72 Z" fill="#fffaf2" stroke="#e6dccd" />
  <Path d="M60 54 L100 54 L102 70 L58 70 Z" fill="#6b3a24" />
</G>);

const Ogutucu = () => (<G>
  <Golge rx={44} />
  <Path d="M56 8 L104 8 L96 44 L64 44 Z" fill="#cfe3ea" opacity="0.9" />
  <Path d="M60 22 L100 22 L96 44 L64 44 Z" fill="#5a3826" />
  <Circle cx="70" cy="30" r="2.5" fill="#3b2418" /><Circle cx="82" cy="34" r="2.5" fill="#3b2418" /><Circle cx="90" cy="28" r="2.5" fill="#3b2418" />
  <Rect x="54" y="4" width="52" height="7" rx="3" fill={KOYU} />
  <Rect x="52" y="44" width="56" height="78" rx="10" fill={KOYU} />
  <Rect x="58" y="50" width="44" height="14" rx="4" fill="#4a3f38" />
  <Circle cx="80" cy="57" r="5" fill={CELIK} />
  <Rect x="70" y="72" width="20" height="10" rx="3" fill={CELIK_KOYU} />
  <Path d="M62 104 L98 104 L98 112 L62 112 Z" fill="#4a3f38" />
</G>);

const EspressoMakinesi = () => (<G>
  <Golge rx={70} />
  <Rect x="18" y="26" width="124" height="96" rx="10" fill={CELIK} />
  <Rect x="18" y="26" width="124" height="16" rx="8" fill={CELIK_ACIK} />
  <Rect x="28" y="12" width="104" height="14" rx="4" fill="#4a3f38" />
  <Circle cx="80" cy="56" r="10" fill="#fffaf2" stroke={KOYU} strokeWidth="2" />
  <Path d="M80 56 L86 50" stroke="#c8553d" strokeWidth="2" />
  <Rect x="40" y="70" width="22" height="10" rx="3" fill={CELIK_KOYU} /><Rect x="98" y="70" width="22" height="10" rx="3" fill={CELIK_KOYU} />
  <Path d="M51 80 L51 88 L74 92" stroke={KOYU} strokeWidth="4" strokeLinecap="round" fill="none" />
  <Path d="M128 60 L134 60 L134 100" stroke={CELIK_KOYU} strokeWidth="4" strokeLinecap="round" fill="none" />
  <Rect x="26" y="106" width="108" height="10" rx="3" fill={CELIK_KOYU} />
  <Rect x="100" y="90" width="18" height="16" rx="3" fill="#fffaf2" stroke="#e6dccd" />
</G>);

const TelveKutusu = () => (<G>
  <Golge rx={50} />
  <Rect x="36" y="44" width="88" height="78" rx="10" fill={KOYU} />
  <Ellipse cx="80" cy="46" rx="44" ry="10" fill="#4a3f38" />
  <Ellipse cx="80" cy="48" rx="36" ry="7" fill={KAHVE} />
  <Rect x="32" y="38" width="96" height="8" rx="4" fill={CELIK_KOYU} />
  <Path d="M54 52 q6 8 12 0 M84 54 q6 8 12 0" stroke="#3b2418" strokeWidth="3" fill="none" />
</G>);

const BuharCubugu = () => (<G>
  <Golge rx={40} />
  <Rect x="62" y="8" width="36" height="24" rx="6" fill={CELIK} />
  <Rect x="74" y="0" width="12" height="10" rx="3" fill="#4a3f38" />
  <Path d="M80 32 L80 92 Q80 102 90 106" stroke={CELIK_KOYU} strokeWidth="8" fill="none" strokeLinecap="round" />
  <Path d="M96 100 q8 -6 4 -14 M104 108 q10 -4 8 -14" stroke="#cfd6dc" strokeWidth="3" fill="none" strokeLinecap="round" />
</G>);

const CekirdekKabi = () => (<G>
  <Golge rx={46} />
  <Rect x="48" y="30" width="64" height="92" rx="10" fill="#3b2418" />
  <Rect x="44" y="22" width="72" height="14" rx="5" fill={KOYU} />
  <Rect x="58" y="58" width="44" height="34" rx="4" fill="#fffaf2" />
  <Ellipse cx="72" cy="75" rx="6" ry="9" fill={KAHVE} transform="rotate(-20 72 75)" />
  <Ellipse cx="88" cy="75" rx="6" ry="9" fill={KAHVE} transform="rotate(20 88 75)" />
</G>);

const Espresso = () => (<G>
  <Golge rx={50} />
  <Ellipse cx="80" cy="118" rx="44" ry="8" fill="#fffaf2" stroke="#e6dccd" />
  <Path d="M48 60 L112 60 L106 106 Q104 114 96 114 L64 114 Q56 114 54 106 Z" fill="#fffaf2" stroke="#e6dccd" />
  <Path d="M112 72 Q128 72 128 86 Q128 98 110 98" stroke="#e6dccd" strokeWidth="6" fill="none" />
  <Ellipse cx="80" cy="62" rx="31" ry="7" fill="#c98a5a" />
  <Path d="M64 62 q8 -3 16 0 q8 3 16 0" stroke="#e0a978" strokeWidth="2" fill="none" />
</G>);


// ---------- Aşçı ----------
const SefBicagi = () => (<G>
  <Golge rx={64} />
  <Path d="M14 92 Q60 70 118 74 L118 92 Z" fill="#dfe3e8" />
  <Path d="M14 92 L118 92 L118 86 Q66 86 14 92 Z" fill={CELIK_KOYU} />
  <Rect x="116" y="72" width="8" height="22" rx="2" fill={CELIK} />
  <Rect x="122" y="76" width="34" height="14" rx="6" fill={KOYU} />
  <Circle cx="132" cy="83" r="2" fill={CELIK} /><Circle cx="146" cy="83" r="2" fill={CELIK} />
</G>);

const KesmeTahtasi = () => (<G>
  <Golge rx={66} />
  <Rect x="18" y="76" width="96" height="44" rx="6" fill="#d8453a" transform="rotate(-8 66 98)" />
  <Rect x="34" y="66" width="96" height="44" rx="6" fill="#2f9e5b" transform="rotate(4 82 88)" />
  <Rect x="50" y="56" width="96" height="44" rx="6" fill="#3a7bd5" transform="rotate(10 98 78)" />
  <Circle cx="132" cy="70" r="5" fill="#fffaf2" opacity="0.8" />
</G>);

const Termometre = () => (<G>
  <Golge rx={40} />
  <Path d="M78 36 L84 36 L84 122 L81 128 L78 122 Z" fill={CELIK} />
  <Rect x="60" y="10" width="42" height="30" rx="8" fill="#2a6f97" />
  <Rect x="66" y="16" width="30" height="16" rx="3" fill="#cfeaf7" />
  <SvgText x="81" y="28" fontSize="11" fontWeight="bold" fill="#14452f" textAnchor="middle">75°C</SvgText>
</G>);

const Buzdolabi = () => (<G>
  <Golge rx={46} />
  <Rect x="44" y="8" width="72" height="116" rx="8" fill="#e8ebee" stroke={CELIK} strokeWidth="2" />
  <Path d="M44 46 L116 46" stroke={CELIK} strokeWidth="2" />
  <Rect x="104" y="18" width="5" height="18" rx="2" fill={CELIK_KOYU} /><Rect x="104" y="56" width="5" height="26" rx="2" fill={CELIK_KOYU} />
  <SvgText x="72" y="32" fontSize="12" fontWeight="bold" fill="#2a6f97" textAnchor="middle">-18°</SvgText>
  <SvgText x="72" y="90" fontSize="12" fontWeight="bold" fill="#2a6f97" textAnchor="middle">0–4°</SvgText>
</G>);

const Julyen = () => (<G>
  <Golge rx={60} />
  <Rect x="20" y="88" width="120" height="30" rx="5" fill="#c8a27a" />
  {[0, 1, 2, 3, 4, 5, 6].map((i) => <Rect key={i} x={30 + i * 14} y={70 - (i % 2) * 4} width="5" height="40" rx="2" fill="#f08a24" transform={`rotate(${(i - 3) * 6} ${32 + i * 14} 90)`} />)}
  <Path d="M118 80 L150 40 L156 46 L124 86 Z" fill="#3f8f3a" />
</G>);

// ---------- Salon servisi ----------
const Tepsi = () => (<G>
  <Golge rx={64} />
  <Ellipse cx="80" cy="104" rx="66" ry="14" fill={CELIK_KOYU} />
  <Ellipse cx="80" cy="100" rx="66" ry="14" fill={CELIK_ACIK} />
  <Path d="M50 98 L50 64 Q50 60 54 60 L66 60 Q70 60 70 64 L70 98 Z" fill="#e8f4fb" stroke="#b9d6e6" />
  <Path d="M86 100 L86 70 L104 70 L104 100 Z" fill="#e8f4fb" stroke="#b9d6e6" />
  <Rect x="52" y="74" width="16" height="22" fill="#f2c94c" opacity="0.8" />
</G>);

const Menaj = () => (<G>
  <Golge rx={44} />
  <Path d="M48 120 L52 54 Q60 40 68 54 L72 120 Z" fill="#fffaf2" stroke="#e6dccd" />
  <Rect x="50" y="40" width="20" height="10" rx="4" fill={CELIK} />
  <Path d="M88 120 L92 54 Q100 40 108 54 L112 120 Z" fill="#3b2418" />
  <Rect x="90" y="40" width="20" height="10" rx="4" fill={CELIK} />
  <Circle cx="56" cy="43" r="1.2" fill={KOYU} /><Circle cx="62" cy="43" r="1.2" fill={KOYU} /><Circle cx="100" cy="43" r="1.2" fill={KOYU} />
</G>);

const MasaDuzeni = () => (<G>
  <Rect x="4" y="20" width="152" height="112" rx="8" fill="#f4efe6" />
  <Circle cx="80" cy="82" r="30" fill="#fff" stroke="#e6dccd" strokeWidth="2" />
  <Circle cx="80" cy="82" r="20" fill="#fffaf2" stroke="#efe7da" />
  <Rect x="38" y="56" width="5" height="52" rx="2" fill={CELIK_KOYU} /><Rect x="28" y="56" width="5" height="52" rx="2" fill={CELIK_KOYU} />
  <Rect x="118" y="56" width="5" height="52" rx="2" fill={CELIK_KOYU} /><Rect x="128" y="56" width="5" height="52" rx="2" fill={CELIK_KOYU} />
  <Rect x="62" y="42" width="40" height="4" rx="2" fill={CELIK_KOYU} />
  <Circle cx="132" cy="40" r="10" fill="#e8f4fb" stroke="#b9d6e6" />
  <Circle cx="22" cy="40" r="10" fill="#fff" stroke="#e6dccd" />
</G>);

const Adisyon = () => (<G>
  <Golge rx={40} />
  <Path d="M50 10 L110 10 L110 120 L104 114 L98 120 L92 114 L86 120 L80 114 L74 120 L68 114 L62 120 L56 114 L50 120 Z" fill="#fffaf2" stroke="#e6dccd" />
  <Rect x="58" y="22" width="44" height="6" rx="2" fill={KOYU} />
  {[38, 50, 62, 74, 86].map((y) => <Rect key={y} x="58" y={y} width={y % 24 ? 36 : 28} height="4" rx="2" fill="#c9bba8" />)}
  <Rect x="58" y="98" width="44" height="5" rx="2" fill="#c8553d" />
</G>);

export const CIZIMLER = {
  portafiltre: Portafiltre, tamper: Tamper, 'sut-potu': SutPotu, terazi: Terazi, ogutucu: Ogutucu,
  'espresso-makinesi': EspressoMakinesi, 'telve-kutusu': TelveKutusu, 'buhar-cubugu': BuharCubugu,
  'cekirdek-kabi': CekirdekKabi, espresso: Espresso,
  'sef-bicagi': SefBicagi, 'kesme-tahtasi': KesmeTahtasi, termometre: Termometre, buzdolabi: Buzdolabi, julyen: Julyen,
  tepsi: Tepsi, menaj: Menaj, 'masa-duzeni': MasaDuzeni, adisyon: Adisyon,
};

export function Cizim({ ad, boyut = 160 }) {
  const C = CIZIMLER[ad];
  if (!C) return null;
  return <Svg width={boyut} height={boyut * 140 / 160} viewBox="0 0 160 140"><C /></Svg>;
}
