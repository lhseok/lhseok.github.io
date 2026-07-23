import { visit } from 'unist-util-visit';

function resolveUnit(val) {
  if (val == null) return null;
  const s = String(val);
  return /[%a-zA-Z]/.test(s) ? s : `${s}px`;
}

function resolveRatio(val) {
  if (!val) return null;
  return val.replace(':', '/');
}

function buildFigure(img) {
  const url = img.url;
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
        const trimmedValue = value.trim();
        try {
          params[key.trim()] = decodeURIComponent(trimmedValue);
        } catch (e) {
          params[key.trim()] = trimmedValue;
        }
      }
    });
  }

  const w = params.w || params.width;
  const h = params.h || params.height;
  const ar = params.ar || params.ratio;
  const pcW = params['pc-w'] || params['pc-width'];
  const pcH = params['pc-h'] || params['pc-height'];
  const moW = params['mo-w'] || params['mo-width'];
  const moH = params['mo-h'] || params['mo-height'];

  const styles = [];
  if (ar) styles.push(`--ar: ${resolveRatio(ar)}`);
  if (w) styles.push(`--w: ${resolveUnit(w)}`);
  if (h) styles.push(`--h: ${resolveUnit(h)}`);
  if (pcW) styles.push(`--pc-w: ${resolveUnit(pcW)}`);
  if (pcH) styles.push(`--pc-h: ${resolveUnit(pcH)}`);
  if (moW) styles.push(`--mo-w: ${resolveUnit(moW)}`);
  if (moH) styles.push(`--mo-h: ${resolveUnit(moH)}`);

  const imgStyle = styles.length > 0 ? ` style="${styles.join('; ')};"` : '';
  const imgClass = styles.length > 0 ? ' class="img-responsive-dimension"' : '';

  return `<figure class="review-inline-image">
  <img src="${baseUrl}" alt="${img.comment || ''}"${imgClass}${imgStyle} />
  ${img.comment ? `<figcaption>${img.comment}</figcaption>` : ''}
</figure>`;
}

export function remarkReviewImages() {
  return (tree, vfile) => {
    const images = vfile.data?.astro?.frontmatter?.images;
    if (!Array.isArray(images) || images.length === 0) return;

    visit(tree, 'paragraph', (node, index, parent) => {
      if (node.children.length === 1 && node.children[0].type === 'text') {
        const text = node.children[0].value.trim();
        const matches = [...text.matchAll(/image\[(\d+)\]/g)];

        if (matches.length === 0) return;

        // Verify the paragraph contains only image[N] tokens and whitespace
        const cleaned = text.replace(/image\[\d+\]/g, '').trim();
        if (cleaned !== '') return;

        const imgs = matches.map(m => images[parseInt(m[1])]).filter(Boolean);
        if (imgs.length === 0) return;

        if (imgs.length === 1) {
          parent.children[index] = { type: 'html', value: buildFigure(imgs[0]) };
        } else {
          const figures = imgs.map(buildFigure).join('\n');
          parent.children[index] = {
            type: 'html',
            value: `<div class="review-image-row">\n${figures}\n</div>`,
          };
        }
      }
    });
  };
}
