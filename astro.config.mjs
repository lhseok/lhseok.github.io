import { defineConfig } from 'astro/config';
import { remarkReviewImages } from './src/utils/remark-review-images.mjs';
import { remarkYoutube } from './src/utils/remark-youtube.mjs';
import remarkImageDimensions from './src/utils/remark-image-dimensions.mjs';

export default defineConfig({
  site: 'https://lhseok.github.io',
  markdown: {
    remarkPlugins: [remarkReviewImages, remarkYoutube, remarkImageDimensions],
  },
});
