import {
    decorateMain,
  } from '../../scripts/scripts.js';
  
  import {
    loadBlocks,
  } from '../../scripts/aem.js';
  
  export async function loadExperienceFragment(path) {
    const pubUrl = 'https://publish-p43602-e1429195.adobeaemcloud.com';
    if (path && path.startsWith('/')) {
      // eslint-disable-next-line no-param-reassign
      path = pubUrl + path.replace(/(\.plain)?\.html/, '');
      const resp = await fetch(`${path}.html`);
      
      if (resp.ok) {
        const main = document.createElement('main');
        main.innerHTML = await resp.text();
        
        //Update the hrefs and remove '.html'
        main.querySelectorAll('[href]').forEach((elem) => {
          var href = elem.getAttribute('href');
          if(href && href.startsWith('/content/intouch-eds/')){
            href = href.replace('/content/intouch-eds/', '/').replace(/(\.plain)?\.html/, '');
            elem.setAttribute('href', href);
            //console.log(hrefVal);
          }
        });

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
    const fragment = await loadExperienceFragment(path);
    if (fragment) {
      const fragmentSection = fragment.querySelector(':scope .section');
      if (fragmentSection) {
        block.classList.add(...fragmentSection.classList);
        block.classList.remove('section');
        block.replaceChildren(...fragmentSection.childNodes);
      }
    }
  }