(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = function(input, options = {}) {
    const method = String(options.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (!['GET', 'HEAD'].includes(method)) {
      alert(document.documentElement.lang === 'pt' ? 'Pré-visualização: os pedidos, pagamentos e mensagens estão desativados.' : 'Preview only: bookings, payments and messages are disabled.');
      return Promise.reject(new Error('Preview mode: submission disabled'));
    }
    return originalFetch(input, options);
  };
  addEventListener('DOMContentLoaded', () => {
    const label = document.createElement('div');
    label.textContent = 'REVIEW PREVIEW · Bookings, payments and messages disabled';
    label.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2147483647;text-align:center;background:#22261d;color:#fff;padding:8px 12px;font:12px/1.4 sans-serif;pointer-events:none';
    document.body.append(label);
  });
})();
