(() => {
  const base = new URL('../', document.currentScript.src);
  const entries = [
  {
    "name": "home",
    "displayName": "HomeIcon",
    "asset": "assets/HomeIcon.svg",
    "width": 18.1712,
    "height": 18.5731,
    "figmaNode": "321:493",
    "sha256": "70701f336cfdd67fe0c6cacbde515c51a4c099b65846e4f8cf428cfbb5145ea4",
    "origin": "Today/Resources/Assets.xcassets/HomeIcon.imageset/HomeIcon.svg"
  },
  {
    "name": "habits",
    "displayName": "HabitsIcon",
    "asset": "assets/HabitsIcon.svg",
    "width": 14.7865,
    "height": 17.7904,
    "figmaNode": "321:502",
    "sha256": "007a4fb0de06dcaf05646b4942448cd9e181595cedbc4df119643954fc587d38",
    "origin": "Today/Resources/Assets.xcassets/HabitsIcon.imageset/HabitsIcon.svg"
  },
  {
    "name": "activity",
    "displayName": "ActivityIcon",
    "asset": "assets/icons/ActivityIcon.svg",
    "width": 20.0027,
    "height": 18.1712,
    "figmaNode": "321:511",
    "sha256": "d9333294cc4412ba46de874991cbb7d029d0f650f2fb33328c26d37ca8a24cdf",
    "origin": "Today/Resources/Assets.xcassets/ActivityIcon.imageset/ActivityIcon.svg"
  },
  {
    "name": "reading",
    "displayName": "ReadingIcon",
    "asset": "assets/icons/ReadingIcon.svg",
    "width": 26.4308,
    "height": 23.2213,
    "figmaNode": "321:520",
    "sha256": "52f4f90900ba52d6955fc01faea798b16ed59de3fbfc935cf779ba53a9a337a2",
    "origin": "Today/Resources/Assets.xcassets/ReadingIcon.imageset/ReadingIcon.svg"
  },
  {
    "name": "chevron",
    "displayName": "Chevron",
    "asset": "assets/icons/Chevron.svg",
    "width": 12.0,
    "height": 16.0,
    "figmaNode": "321:527",
    "sha256": "a8c761d7c84d58ff2868674fc88665b48721dc3cc585d4f0bf831af792fa9edf",
    "origin": "Today/Resources/Assets.xcassets/Chevron.imageset/Chevron.svg"
  },
  {
    "name": "close",
    "displayName": "Close",
    "asset": "assets/icons/Close.svg",
    "width": 16.0,
    "height": 16.0,
    "figmaNode": "321:534",
    "sha256": "4674880e59a3e1ac424570b2efdba5290196405ab39c67538f1193b182e37ded",
    "origin": "Today/Resources/Assets.xcassets/Close.imageset/Close.svg"
  },
  {
    "name": "double-chevron",
    "displayName": "DoubleChevron",
    "asset": "assets/icons/DoubleChevron.svg",
    "width": 20.0,
    "height": 20.0,
    "figmaNode": "321:541",
    "sha256": "89c9f3381d68437e102d402cf8b228712e8c25e6e02de087f8d68acbcdbc4559",
    "origin": "Today/Resources/Assets.xcassets/DoubleChevron.imageset/DoubleChevron.svg"
  },
  {
    "name": "pencil",
    "displayName": "Pencil",
    "asset": "assets/icons/Pencil.svg",
    "width": 17.0306,
    "height": 17.0307,
    "figmaNode": "321:550",
    "sha256": "0d40b986754da37acbf5aa736abdc52bab346959f272be1036304e2546434b68",
    "origin": "Today/Resources/Assets.xcassets/Pencil.imageset/Pencil.svg"
  },
  {
    "name": "planned-day",
    "displayName": "PlannedDay",
    "asset": "assets/widgets/PlannedDay.svg",
    "width": 15.0,
    "height": 15.0,
    "figmaNode": "321:556",
    "sha256": "2bc909461c07de7e88a97bd1cb250c148d2287cc705931f7ec76e444be4eadf2",
    "origin": "Today/Resources/Assets.xcassets/PlannedDay.imageset/PlannedDay.svg"
  },
  {
    "name": "day-off",
    "displayName": "DayOff",
    "asset": "assets/widgets/DayOff.svg",
    "width": 15.0,
    "height": 15.0,
    "figmaNode": "321:562",
    "sha256": "8cc1b245c2fdcfb7e71cfb2bdb8a28dc9e7804993e1542799d36ca6e84570036",
    "origin": "Today/Resources/Assets.xcassets/DayOff.imageset/DayOff.svg"
  },
  {
    "name": "increase",
    "displayName": "CounterIncrease",
    "asset": "assets/icons/CounterIncrease.svg",
    "width": 48.0,
    "height": 48.0,
    "figmaNode": null,
    "sha256": "330b5cd328ac28d3ca315d3fb08f5faf2af62586fc6a157e3ba96b257c6d26c6",
    "origin": "Today/Assets.xcassets/CounterIncrease.imageset/CounterIncrease.svg"
  },
  {
    "name": "decrease",
    "displayName": "CounterDecrease",
    "asset": "assets/icons/CounterDecrease.svg",
    "width": 48.0,
    "height": 48.0,
    "figmaNode": null,
    "sha256": "59f480ec657cc6e2894639d790df6458b4e300e5f8a5b1dce1959c8db49785c4",
    "origin": "Today/Assets.xcassets/CounterDecrease.imageset/CounterDecrease.svg"
  }
];
  const icons = Object.freeze(Object.fromEntries(entries.map(item => [item.name, Object.freeze(item)])));
  function create(name, label = '') {
    const meta = icons[name];
    if (!meta) return document.createElement('span');
    const img = document.createElement('img');
    img.src = new URL(meta.asset, base).href; img.alt = label;
    img.width = meta.width; img.height = meta.height; img.draggable = false;
    img.style.width = meta.width + 'px'; img.style.height = meta.height + 'px';
    return img;
  }
  class TodayIcon extends HTMLElement {
    static observedAttributes = ['name', 'label'];
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() { this.replaceChildren(create(this.getAttribute('name'), this.getAttribute('label') || '')); }
  }
  window.TodayIcons = Object.freeze({icons, create});
  if (!customElements.get('today-icon')) customElements.define('today-icon', TodayIcon);
})();
