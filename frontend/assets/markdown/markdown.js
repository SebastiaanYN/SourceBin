import { sanitize } from './dompurify.js';
import MarkedWorker from './marked.worker.js';

export function render(markdown) {
  return new Promise((res, rej) => {
    const worker = new MarkedWorker();

    const timeout = setTimeout(() => {
      worker.terminate();
      rej(new Error('Rendering took too long!'));
    }, 30 * 1000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();

      res(sanitize(e.data));
    };

    worker.postMessage(markdown);
  });
}

export function isMarkdown(language) {
  return language === 'Markdown';
}
