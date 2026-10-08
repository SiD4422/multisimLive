const fs = require('fs');
const postcss = require('postcss');
const prefixer = require('postcss-prefix-selector');

const css = fs.readFileSync('C:/Users/spart/Downloads/nodesim-site/nodesim-site/assets/site.css', 'utf8');

const out = postcss().use(prefixer({
  prefix: '.about-page',
  exclude: [':root', 'html', 'body'],
  transform: function (prefix, selector, prefixedSelector, filePath, rule) {
    if (selector === ':root' || selector.startsWith(':root')) {
      return selector.replace(':root', '.about-page');
    }
    if (selector === 'body' || selector === 'html') {
      return '.about-page';
    }
    return prefixedSelector;
  }
})).process(css).css;

fs.writeFileSync('../src/pages/AboutPage.css', out);
console.log('CSS Scoped!');
