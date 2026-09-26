export default defineNuxtConfig({
  compatibilityDate: '2026-09-26',
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    sessionSecret: '',
  },
  app: {
    head: {
      title: 'Priority Pokémon',
      meta: [
        { name: 'description', content: 'Explore the Pokédex and build your own Pokémon collection.' },
        { name: 'theme-color', content: '#f7f5ef' },
      ],
    },
  },
})
