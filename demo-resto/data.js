// Données de la démo restaurant (stockées dans le navigateur, aucune base de données)
var DEMO_KEY = 'qrguide_demo_resto_v1';
var DEMO_DEFAULT = {
  name: 'Le Fournil Créole',
  tagline: 'Cuisine réunionnaise & produits locaux',
  title: 'Menu de la semaine',
  special: { on: true, text: 'Cari de poulet fermier, riz, grains, rougail', price: '14', note: 'Plat du jour' },
  hours: 'Midi 11h30–14h30 · Soir 18h30–22h · Fermé le dimanche',
  cover: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  phone: '0262 00 00 00',
  wifi: 'FOURNIL-GUEST / bonappetit974',
  reviewUrl: 'https://www.google.com/maps',
  updated: null,
  categories: [
    { name: 'Entrées', en: 'Starters', items: [
      { nom: 'Salade de chouchou et crevettes', en: 'Chayote and prawn salad', desc: 'Vinaigrette citron vert, coriandre', prix: '9', all: 'Crustacés', dispo: true },
      { nom: 'Accras de morue', en: 'Cod fritters', desc: 'Sauce pimentée maison', prix: '8', all: 'Poisson, gluten', dispo: true },
      { nom: 'Samoussas de légumes', en: 'Vegetable samosas', desc: 'Trio, chutney de mangue', prix: '7', all: 'Gluten', dispo: true } ] },
    { name: 'Plats', en: 'Mains', items: [
      { nom: 'Cari poulet', en: 'Chicken curry', desc: 'Riz, grains, rougail tomate', prix: '16', all: '', dispo: true },
      { nom: 'Rougail saucisses', en: 'Sausage rougail', desc: 'Riz, brèdes, piment du jardin', prix: '15', all: '', dispo: true },
      { nom: 'Poisson du jour grillé', en: 'Grilled fish of the day', desc: 'Légumes péï, beurre blanc vanille', prix: '21', all: 'Poisson, lait', dispo: true },
      { nom: 'Burger créole', en: 'Creole burger', desc: 'Bœuf local, bacon, sauce chouchou', prix: '17', all: 'Gluten, œuf, lait', dispo: false } ] },
    { name: 'Desserts', en: 'Desserts', items: [
      { nom: 'Gâteau patate douce', en: 'Sweet potato cake', desc: 'Crème anglaise vanille Bourbon', prix: '7', all: 'Gluten, œuf, lait', dispo: true },
      { nom: 'Salade de fruits frais', en: 'Fresh fruit salad', desc: 'Ananas Victoria, litchi, mangue', prix: '6', all: '', dispo: true } ] },
    { name: 'Boissons', en: 'Drinks', items: [
      { nom: 'Jus de fruits pressés', en: 'Fresh juice', desc: '', prix: '4', all: '', dispo: true },
      { nom: 'Bière Dodo', en: 'Dodo beer', desc: '33 cl', prix: '4,5', all: 'Gluten', dispo: true },
      { nom: 'Rhum arrangé', en: 'Infused rum', desc: 'Selon la maison', prix: '6', all: '', dispo: true } ] }
  ],
  stats: { scans: [34, 41, 38, 52, 77, 95, 61], days: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'] }
};
function demoLoad() {
  try { var s = localStorage.getItem(DEMO_KEY); if (s) return JSON.parse(s); } catch (e) {}
  return JSON.parse(JSON.stringify(DEMO_DEFAULT));
}
function demoSave(d) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); } catch (e) {} }
function demoReset() { try { localStorage.removeItem(DEMO_KEY); } catch (e) {} }
function esc(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
