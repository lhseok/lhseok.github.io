import { visit } from 'unist-util-visit';

export default function remarkImageDimensions() {
  return (tree) => {
    visit(tree, 'image', (node, index, parent) => {
      const url = node.url || '';
      const altText = (node.alt || '').trim();
      
      const separator = '!!';
      let baseUrl = url;
      let queryString = '';

      if (url.includes(separator)) {
        const parts = url.split(separator);
        baseUrl = parts[0];
        queryString = parts[1];
      }

      const params = {};
      if (queryString) {
        queryString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[key.trim()] = decodeURIComponent(value.trim());
          }
        });
      }

      const ar = params.ar || params.ratio;
      const w = params.w || params.width;
      const h = params.h || params.height;
      const pcW = params['pc-w'] || params['pc-width'];
      const pcH = params['pc-h'] || params['pc-height'];
      const moW = params['mo-w'] || params['mo-width'];
      const moH = params['mo-h'] || params['mo-height'];

      const styles = [];
      if (ar) styles.push(`--ar: ${ar.replace(':', '/')}`);
      if (w) styles.push(`--w: ${/[%a-zA-Z]/.test(w) ? w : w + 'px'}`);
      if (h) styles.push(`--h: ${/[%a-zA-Z]/.test(h) ? h : h + 'px'}`);
      if (pcW) styles.push(`--pc-w: ${/[%a-zA-Z]/.test(pcW) ? pcW : pcW + 'px'}`);
      if (pcH) styles.push(`--pc-h: ${/[%a-zA-Z]/.test(pcH) ? pcH : pcH + 'px'}`);
      if (moW) styles.push(`--mo-w: ${/[%a-zA-Z]/.test(moW) ? moW : moW + 'px'}`);
      if (moH) styles.push(`--mo-h: ${/[%a-zA-Z]/.test(moH) ? moH : moH + 'px'}`);

      const styleStr = styles.length > 0 ? ` style="${styles.join('; ')};"` : '';
      const className = 'img-responsive-dimension';

      // Check if standalone image in a paragraph
      const isStandalone = parent && parent.type === 'paragraph' && 
                          parent.children.filter(c => !(c.type === 'text' && !c.value.trim())).length === 1;

      if (isStandalone && altText) {
        node.type = 'html';
        node.value = `<figure class="post-image-figure">
  <img src="${baseUrl}" alt="${altText}" class="${className}"${styleStr} />
  <figcaption class="post-content-comment">${altText}</figcaption>
</figure>`;
      } else {
        node.url = baseUrl;
        node.data = node.data || {};
        node.data.hProperties = {
          ...node.data.hProperties,
          style: styleStr.replace(' style="', '').replace('"', ''),
          className: [className]
        };
      }
    });
  };
}
