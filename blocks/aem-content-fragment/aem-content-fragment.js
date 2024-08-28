import {
    decorateMain,
  } from '../../scripts/scripts.js';
  
  import {
    loadBlocks,
  } from '../../scripts/aem.js';
  
  export async function loadContentFragment(path) {
    if (path && path.startsWith('/')) {
      // eslint-disable-next-line no-param-reassign
      path = path.replace(/(\.plain)?\.html/, '');
      path = path.replace('/content/dam/', '/api/assets/');
      const resp = await fetch(`${path}.json`);
      if (resp.ok) {
        const main = document.createElement('main');
        const jsonResp = await resp.text();
        main.innerHTML = await resp.text();
  
        // reset base path for media to fragment base
        const resetAttributeBase = (tag, attr) => {
          main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
            elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
          });
        };
        resetAttributeBase('img', 'src');
        resetAttributeBase('source', 'srcset');
  
        decorateMain(main);
        await loadBlocks(main);
        return main;
      }
    }
    return null;
  }



  export default async function decorate(block) {
    const link = block.querySelector('a');
    const path = link ? link.getAttribute('href') : block.textContent.trim();
    const fragment = await loadContentFragment(path);
    if (fragment) {
      const fragmentSection = fragment.querySelector(':scope .section');
      if (fragmentSection) {
        block.classList.add(...fragmentSection.classList);
        block.classList.remove('section');
        block.replaceChildren(...fragmentSection.childNodes);
      }
    }
  }