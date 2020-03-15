import { linguist, languages } from '@sourcebin/linguist';

import { eventBus } from '@/assets/eventBus.js';

export function getLanguageById(id) {
  return linguist[id];
}

export function getLanguageByName(name) {
  const id = languages[name];
  return getLanguageById(id);
}

export function getActiveLanguage(store, route, file) {
  if (route.query.lang) {
    const language = getLanguageByName(route.query.lang);

    if (language) {
      return language;
    }
  }

  if (store.state.bin.files[file].languageId !== undefined) {
    return getLanguageById(store.state.bin.files[file].languageId);
  }

  return getLanguageById(store.state.settings.defaultLanguageId);
}

export function promptLanguageSelect(store, file) {
  return new Promise((res) => {
    eventBus.$emit('promptLanguageSelect', (languageId) => {
      if (languageId !== undefined) {
        store.commit('bin/setLanguageId', {
          languageId,
          file,
        });
      }

      res(languageId);
    });
  });
}

export function promptDefaultLanguageSelect(store) {
  return new Promise((res) => {
    eventBus.$emit('promptLanguageSelect', (languageId) => {
      if (languageId !== undefined) {
        store.commit('settings/setDefaultLanguageId', languageId);
      }

      res(languageId);
    });
  });
}
