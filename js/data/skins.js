// What crystals buy: a colour treatment on the hero's sprite.
//
// A CSS filter rather than a second set of generated art. Eleven characters
// already need four pose frames each; another full costume set per skin would
// double the asset budget for something a player sees at 160 pixels tall.
export const SKINS = [
  {
    id: 'none', price: 0, filter: '',
    name: { kk: 'Әдепкі', ru: 'Обычный' },
  },
  {
    id: 'dusk', price: 30, filter: 'hue-rotate(-25deg) saturate(1.15)',
    name: { kk: 'Ымырт сауыты', ru: 'Сумеречный доспех' },
  },
  {
    id: 'frost', price: 45, filter: 'hue-rotate(150deg) saturate(1.2) brightness(1.05)',
    name: { kk: 'Аяз сауыты', ru: 'Морозный доспех' },
  },
  {
    id: 'ember', price: 60, filter: 'hue-rotate(-60deg) saturate(1.5) contrast(1.05)',
    name: { kk: 'Шоқ сауыты', ru: 'Тлеющий доспех' },
  },
  {
    id: 'void', price: 90, filter: 'grayscale(0.65) contrast(1.25) brightness(0.9)',
    name: { kk: 'Нөл сауыты', ru: 'Доспех Ноля' },
  },
];

export const skinById = (id) => SKINS.find((s) => s.id === id) ?? SKINS[0];
