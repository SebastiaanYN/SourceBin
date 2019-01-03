(() => {
  source('setTheme', (theme = {}) => {
    if (!theme.ace || !theme.name) theme = JSON.parse(localStorage.getItem('theme')) || {};
    if (!theme.ace || !theme.name) theme = { ace: 'material', name: 'Material' };

    localStorage.setItem('theme', JSON.stringify(theme));
    source.$.id('theme').innerHTML = `Theme - ${theme.name}`;

    source.editor.setTheme(`ace/theme/${theme.ace}`);
  });

  source('setMode', language => {
    if (language) source.update({ language });
    else {
      language = source.language;
      if (!language) return;
    }

    source.$.id('language').innerHTML = `Language - ${language.name}`;
    source.editor.session.setMode(`ace/mode/${language.ace_mode}`);
    source.setUrl();
  });

  source('setUrl', () => {
    const key = source.key;
    const language = source.language;
    let url = window.location.origin;
    if (key) {
      url += '/' + key;
      if (language && language.extension) url += language.extension;
    }

    window.history.replaceState(null, null, url);
    return url;
  });

  source('save', async () => {
    const response = await source.request('post', '/bin', source.editor.getValue());
    if (!response) return;
    source.update('key', response.key);

    source.languageSelector.open(async () => {
      const url = source.setUrl();
      const result = await navigator.permissions.query({ name: 'clipboard-write' })
      if (result.state == 'granted' || result.state === 'prompt') {
        navigator.clipboard.writeText(url).then(() => {
          source.popup('Copied Link to Clipboard');
        }, () => {
          source.popup('Saved the bin, you can copy the link now');
        });
      } else {
        source.popup('Saved the bin, you can copy the link now');
      }
    });
  });
})();

(async () => {
  await source.require('./assets/editor/ace.js');
  await source.require('./assets/homepage/js/selector.js');
  source.require('./assets/homepage/js/popup.js');

  ace.config.set('basePath', '/assets/editor');
  ace.config.set('modePath', '/assets/editor');
  ace.config.set('themePath', '/assets/editor');

  const editor = ace.edit('editor');
  source({ editor });

  editor.setFontSize(15);
  source.setTheme('discord');
  source.setMode();

  editor.container.style.display = 'inherit';
  editor.focus();

  const $ = source.$;
  const $save = $.id('save');
  $save.on('click', () => {
    if ($save.hasClass('disabled')) return;

    $save.addClass('disabled');
    source.save();
  });

  source.shortcut(e => e.key === 's' && e.ctrlKey, e => {
    $save.click();
    e.preventDefault();
  });

  $.id('new').on('click', () => {
    // TODO: Empty bin but stay on this page
    window.location.href = origin;
  });

  const languageSelector = new source.selector('Language', source.languages, async e => {
    const language = e.target.innerHTML;
    const response = await source.request('get', `/language?search=${encodeURIComponent(language)}`);
    if (!response) return;

    localStorage.setItem('language', JSON.stringify(response));
    source.setMode(response);
  });
  const themeSelector = new source.selector('Theme', source.themes, async e => {
    const theme = e.target.innerHTML;
    const response = await source.request('get', `/theme?search=${encodeURIComponent(theme)}`);
    if (!response) return;

    source.setTheme(response);
  });
  source({ languageSelector, themeSelector });

  $.id('language').on('click', () => {
    languageSelector.open();
  });

  $.id('theme').on('click', () => {
    themeSelector.open();
  });

  $.id('profile').on('click', () => {
    // TODO: Open profile page on this page
    window.open('/profile', '_self');
  });
})();