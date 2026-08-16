<script setup lang="ts">
import type { DocsLocale } from '../../navigation/routes'
import { computed } from 'vue'
import { homeContent } from '../../home/content'

const props = defineProps<{ locale: DocsLocale }>()
const content = computed(() => homeContent[props.locale])
</script>

<template>
  <main class="repoctl-home">
    <section class="repoctl-home__hero">
      <div class="repoctl-home__hero-copy">
        <p class="repoctl-home__eyebrow">
          {{ content.hero.label }}
        </p>
        <h1>{{ content.hero.title }}</h1>
        <p class="repoctl-home__lede">
          {{ content.hero.description }}
        </p>
        <div class="repoctl-home__actions">
          <a class="repoctl-home__button repoctl-home__button--primary" :href="content.hero.primary.href">
            {{ content.hero.primary.label }}
          </a>
          <a class="repoctl-home__button" :href="content.hero.secondary.href">
            {{ content.hero.secondary.label }}
          </a>
        </div>
      </div>
      <figure class="repoctl-home__capture">
        <img src="/repoctl-doctor.png" :alt="content.hero.imageAlt" width="1440" height="990">
      </figure>
    </section>

    <section class="repoctl-home__proof" :aria-label="locale === 'en' ? 'repoctl capabilities' : 'repoctl 能力'">
      <span v-for="item in content.proof" :key="item">{{ item }}</span>
    </section>

    <section class="repoctl-home__section repoctl-home__lifecycle">
      <div class="repoctl-home__section-heading">
        <h2>{{ content.lifecycle.title }}</h2>
        <p>{{ content.lifecycle.description }}</p>
      </div>
      <ol>
        <li v-for="step in content.lifecycle.steps" :key="step.command">
          <code>{{ step.command }}</code>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <section class="repoctl-home__section repoctl-home__paths">
      <div class="repoctl-home__section-heading">
        <h2>{{ content.paths.title }}</h2>
        <p>{{ content.paths.description }}</p>
      </div>
      <div class="repoctl-home__path-grid">
        <article v-for="item in content.paths.items" :key="item.href">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
          <pre><code>{{ item.commands.join('\n') }}</code></pre>
          <a :href="item.href">{{ item.linkLabel }}</a>
        </article>
      </div>
    </section>

    <section class="repoctl-home__section repoctl-home__capabilities">
      <div class="repoctl-home__section-heading">
        <p class="repoctl-home__eyebrow">
          repoctl
        </p>
        <h2>{{ content.capabilities.title }}</h2>
        <p>{{ content.capabilities.description }}</p>
      </div>
      <div class="repoctl-home__capability-grid">
        <article v-for="item in content.capabilities.items" :key="item.title">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section class="repoctl-home__section repoctl-home__commands">
      <div class="repoctl-home__section-heading">
        <h2>{{ content.commands.title }}</h2>
        <p>{{ content.commands.description }}</p>
      </div>
      <dl>
        <div v-for="item in content.commands.items" :key="item.command">
          <dt><code>{{ item.command }}</code></dt>
          <dd>{{ item.purpose }}</dd>
        </div>
      </dl>
    </section>

    <section class="repoctl-home__section repoctl-home__automation">
      <div>
        <h2>{{ content.automation.title }}</h2>
        <p>{{ content.automation.description }}</p>
        <ul>
          <li v-for="format in content.automation.formats" :key="format">
            {{ format }}
          </li>
        </ul>
      </div>
      <pre><code>{{ content.automation.code }}</code></pre>
    </section>

    <section class="repoctl-home__section repoctl-home__quickstart">
      <div class="repoctl-home__section-heading">
        <h2>{{ content.quickstart.title }}</h2>
        <p>{{ content.quickstart.description }}</p>
      </div>
      <pre><code>{{ content.quickstart.code }}</code></pre>
      <a class="repoctl-home__button repoctl-home__button--primary" :href="content.quickstart.link.href">
        {{ content.quickstart.link.label }}
      </a>
    </section>

    <section class="repoctl-home__section repoctl-home__docs">
      <div class="repoctl-home__section-heading">
        <h2>{{ content.docs.title }}</h2>
        <p>{{ content.docs.description }}</p>
      </div>
      <div>
        <a v-for="item in content.docs.items" :key="item.href" :href="item.href">
          <strong>{{ item.label }}</strong>
          <span>{{ item.body }}</span>
        </a>
      </div>
    </section>
  </main>
</template>
