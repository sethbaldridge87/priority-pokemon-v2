<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="container site-header__inner">
        <NuxtLink class="brand" to="/" aria-label="Priority Pokémon home">
          <span class="brand__ball" aria-hidden="true" />
          <span>Priority<span class="brand__accent">Pokémon</span></span>
        </NuxtLink>
        <nav class="site-nav" aria-label="Main navigation">
          <NuxtLink to="/">Explore</NuxtLink>
          <NuxtLink to="/collection">My collection</NuxtLink>
        </nav>
      </div>
    </header>

    <main id="main-content" class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container site-footer__inner">
        <span>Made for curious trainers.</span>
        <span>Pokémon data from <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">PokéAPI</a>.</span>
      </div>
    </footer>
  </div>
</template>
