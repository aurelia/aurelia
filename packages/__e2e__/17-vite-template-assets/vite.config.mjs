import aurelia from '@aurelia/vite-plugin';

export default {
  build: {
    target: 'es2022',
  },
  plugins: [
    aurelia(),
  ],
};
