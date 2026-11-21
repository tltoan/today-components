/* Face picker colors extend the existing six avatar gradients without changing
   current profile or party fallbacks. Persist the explicit index after selection. */
window.TodayFacePalettes = Object.freeze({
  names: ['Lavender','Rose','Blue','Peach','Sage','Dusk','Lilac','Mist','Moss','Clay','Iris','Slate'],
  colors: [...TodayPartyAvatars.palettes,
    ['#70668f','#9980ac','#ae9ba6'], ['#536c88','#81929b','#b0a4ad'],
    ['#486e69','#6c8777','#a29b78'], ['#886765','#ad8877','#7e728e'],
    ['#4d5c92','#8174b0','#9b7aab'], ['#4b6275','#707586','#93949b']]
});
