import {
    decorateMain,
  } from '../../scripts/scripts.js';
  
  import {
    loadBlocks,
  } from '../../scripts/aem.js';
  
  export async function loadContentFragment(path) {
    const pubUrl = 'https://publish-p43602-e1429195.adobeaemcloud.com';
    if (path && path.startsWith('/')) {
      // eslint-disable-next-line no-param-reassign
      path = path.replace(/(\.plain)?\.html/, '');
      path = pubUrl + path.replace('/content/dam/', '/api/assets/');
      const resp = await fetch(`${path}.json`);
      
      if (resp.ok) {
        const main = document.createElement('main');
        const jsonRespStr = await resp.text();
        const jsonRespMap = JSON.parse(jsonRespStr);
        const parentDiv = document.createElement('div');
        main.appendChild(parentDiv);
        //Iterate Over each field names based on the element order
        for(let attrName in jsonRespMap.properties.elementsOrder){
          let fldName = jsonRespMap.properties.elementsOrder[attrName];
          //console.log(fldName);
          console.log(jsonRespMap.properties.elements[fldName].title);
          const topDiv = document.createElement('div');
          parentDiv.appendChild(topDiv);
          const labelDiv = document.createElement('div');
          labelDiv.textContent = (jsonRespMap.properties.elements[fldName].title);
          topDiv.appendChild(labelDiv);
          const valueDiv = document.createElement('div');
          valueDiv.textContent = (jsonRespMap.properties.elements[fldName].value);
          topDiv.appendChild(valueDiv);
        }
        //main.innerHTML = jsonRespStr;
  
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