<script setup lang="ts">
  import PersonCredit from '@/components/credits/PersonCredit.vue'
  import ProviderCredit from '@/components/credits/ProviderCredit.vue'
  import TechnologyCredit from '@/components/credits/TechnologyCredit.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title'
  import setHeadMeta from '@/utils/setHeadMeta'

  title.value = 'Credits'

  setHeadMeta({
    page: 'Credits',
    subtitle: 'Credits to the people and technologies that make Byg possible.',
  })
</script>

<template>
  <ContentArea class="bygCredits">
    <h3>Thank you!</h3>
    <!-- prettier-ignore -->
    <p class="centerText">Byg would not be possible without all of the wonderful people, technologies, and providers that we use to develop, maintain, and run Byg.</p>

    <section>
      <h4>Byg Team</h4>
      <p>Our valued members.</p>

      <div class="peopleGrid">
        <PersonCredit
          avatar-url="https://a35hie.me/images/avatar-26.webp"
          role="CEO"
          name="ashie"
          byg-username="a35hie"
          homepage="https://a35.dev/"
        />

        <PersonCredit
          avatar-url="https://a35hie.me/images/avatar-26.webp"
          role="Owner"
          name="ashie"
          byg-username="a35hie"
          homepage="https://a35.dev/"
        />

        <PersonCredit
          avatar-url="https://cdn.discordapp.com/avatars/1346178810566938675/17e2d26cb32da23daeae47600748ec9d.webp?size=240"
          role="Co-Owner"
          name="Dima"
          byg-username="dima"
        />

        <PersonCredit
          avatar-url="https://a35hie.me/images/avatar-26.webp"
          role="Lead Developer"
          name="ashie"
          byg-username="a35hie"
          homepage="https://a35.dev/"
        />

        <PersonCredit
          avatar-url="https://a35hie.me/images/avatar-26.webp"
          role="Lead Designer"
          name="ashie"
          byg-username="a35hie"
          homepage="https://a35.dev/"
        />

        <PersonCredit
          avatar-url="https://cdn.discordapp.com/avatars/1346178810566938675/17e2d26cb32da23daeae47600748ec9d.webp?size=240"
          role="Marketer"
          name="Dima"
          byg-username="dima"
        />

        <PersonCredit
          avatar-url="https://cdn.discordapp.com/avatars/403259010154889226/f94499dcc2b7eea1e06ffc335e3f94dc.webp?size=240"
          role="being cute"
          name="Allie"
        />

        <PersonCredit
          avatar-url="https://cdn.discordapp.com/avatars/1428344120291623015/ff231ed7894195d0c183a341b66bb8b5.webp?size=240"
          role="Character Design"
          name="Lulu"
          byg-username="Le_Lulu"
        />
      </div>
    </section>

    <section>
      <h4>Technologies</h4>
      <p>Frameworks and languages used.</p>

      <VStack class="fullWidth">
        <TechnologyCredit
          name="Vue.js"
          description="Progressive web framework for JavaScript."
          icon="logos:vue"
          link="https://vuejs.org/"
        />

        <TechnologyCredit
          name="Elysia"
          description="Lightning-fast, Bun-based backend framework."
          icon="skill-icons:elysia-dark"
          link="https://elysiajs.com/"
        />

        <TechnologyCredit
          name="Bun"
          description="Ultra-fast, modern JavaScript runtime."
          icon="devicon:bun"
          link="https://bun.sh/"
        />

        <TechnologyCredit
          name="TypeScript"
          description="Typed superset of JavaScript for safer, scalable code."
          icon="logos:typescript-icon"
          link="https://www.typescriptlang.org/"
        />

        <TechnologyCredit
          name="Sass"
          description="CSS preprocessor with variables, nesting, and more."
          icon="logos:sass"
          link="https://sass-lang.com/"
        />
      </VStack>
    </section>

    <section>
      <h4>Providers</h4>
      <p>Services that help host Byg.</p>

      <HStack>
        <ProviderCredit
          name="Cloudflare"
          icon="devicon:cloudflare"
          link="https://www.cloudflare.com/"
        />
        <ProviderCredit
          name="Github"
          icon="mdi:github"
          link="https://github.com/"
        />
        <ProviderCredit
          name="Render.com"
          icon="simple-icons:render"
          link="https://render.com/"
        />
      </HStack>
    </section>
  </ContentArea>
</template>

<style scoped lang="sass">
  section
    display: flex
    flex-direction: column
    align-items: center
    margin-top: 1.5rem
    width: 100%
    gap: 0

    p
      margin-bottom: 1rem

    .peopleGrid
      display: grid
      grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr))
      gap: 1rem
      width: 100%
</style>
