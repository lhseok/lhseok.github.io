import { visit } from 'unist-util-visit';

function resolveUnit(val) {
  if (val == null) return null;
  const s = String(val);
  return /[%a-zA-Z]/.test(s) ? s : `${s}px`;
}

function resolveRatioAsPadding(ar) {
  if (!ar) return '56.25%'; // Default 16:9
  const [w, h] = ar.split(':').map(Number);
  if (w && h) return `${(h / w * 100).toFixed(2)}%`;
  return '56.25%';
}

function parseParams(queryString) {
  const params = {};
  if (!queryString) return params;
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
  return params;
}

function buildYoutubeEmbed(videoUrl) {
  if (!videoUrl) return '';
  
  const separator = '!!';
  let baseUrl = videoUrl;
  let queryString = '';
  
  if (videoUrl.includes(separator)) {
    const parts = videoUrl.split(separator);
    baseUrl = parts[0];
    queryString = parts[1];
  }
  
  const videoIdMatch = baseUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) return '';

  const videoId = videoIdMatch[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  const params = parseParams(queryString);
  const w = params.w || params.width;
  const ar = params.ar || params.ratio;
  
  const containerStyles = [
    'position: relative',
    `padding-bottom: ${resolveRatioAsPadding(ar)}`,
    'height: 0',
    'overflow: hidden',
    'max-width: 100%',
    'border-radius: 8px'
  ];
  
  if (w) {
    containerStyles.push(`width: ${resolveUnit(w)}`);
    containerStyles.push('margin: 0 auto');
  }

  return `
<div class="youtube-embed-container" style="${containerStyles.join('; ')};">
  <iframe 
    src="${embedUrl}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>`;
}

function buildYoutubeFigure(data) {
  if (!data || !data.url) return '';
  const embedHtml = buildYoutubeEmbed(data.url);
  if (!embedHtml) return '';

  return `<figure class="review-inline-image">
  ${embedHtml}
  ${data.comment ? `<figcaption>${data.comment}</figcaption>` : ''}
</figure>`;
}

export function remarkYoutube() {
  return (tree, vfile) => {
    const youtubeData = vfile.data?.astro?.frontmatter?.youtube;

    visit(tree, 'paragraph', (node, index, parent) => {
      if (node.children.length !== 1 || node.children[0].type !== 'text') return;

      const text = node.children[0].value.trim();
      
      // 1. Check for youtube[n] placeholders
      const matches = [...text.matchAll(/youtube\[(\d+)\]/g)];
      
      if (matches.length > 0) {
        // Verify the paragraph contains only youtube[N] tokens and whitespace
        const cleaned = text.replace(/youtube\[\d+\]/g, '').trim();
        if (cleaned !== '') return;

        if (!Array.isArray(youtubeData)) return;

        const items = matches.map(m => {
          const idx = parseInt(m[1]);
          return youtubeData[idx];
        }).filter(Boolean);
        
        if (items.length === 0) return;

        if (items.length === 1) {
          parent.children[index] = { type: 'html', value: buildYoutubeFigure(items[0]) };
        } else {
          const figures = items.map(buildYoutubeFigure).join('\n');
          parent.children[index] = {
            type: 'html',
            value: `<div class="review-image-row">\n${figures}\n</div>`,
          };
        }
        return;
      }

      // 2. Check for naked URL (only if no youtube[n] matches were processed)
      // Updated regex to handle !! parameters
      const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:!!\S+)?(?:\S+)?$/;
      if (youtubeRegex.test(text)) {
        const embedHtml = buildYoutubeEmbed(text);
        if (embedHtml) {
          parent.children[index] = {
            type: 'html',
            value: `\n<div style="margin: 24px 0;">\n${embedHtml}\n</div>\n`
          };
        }
      }
    });
  };
}
