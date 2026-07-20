// ===== API Base URL =====
const API_BASE = '';

// ===== Utility Functions =====

/**
 * Syntax-highlight JSON for display in <pre> tags
 */
function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return json.replace(
    /("(?:[^"\\]|\\.)*")(?:\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, key, bool, num) => {
      if (key) {
        return key.endsWith(':')
          ? `<span class="key">${key.slice(0, -1)}</span><span class="key">:</span>`
          : `<span class="string">${key}</span>`;
      }
      if (bool) return `<span class="boolean">${bool}</span>`;
      if (num) return `<span class="number">${num}</span>`;
      return match;
    }
  );
}

/**
 * Show loading state on a button
 */
function setLoading(endpointId, loading) {
  const spinner = document.getElementById(`spinner-${endpointId}`);
  const btnText = document.getElementById(`btn-text-${endpointId}`);
  const btn = btnText?.closest('button');
  if (spinner) spinner.classList.toggle('active', loading);
  if (btn) btn.disabled = loading;
}

/**
 * Display API response in the response area
 */
function showResponse(endpointId, data) {
  const area = document.getElementById(`response-${endpointId}`);
  const content = document.getElementById(`response-${endpointId}-content`);
  if (!area || !content) return;

  area.classList.add('active');
  content.innerHTML = syntaxHighlight(data);
}

/**
 * Clear a response area
 */
function clearResponse(endpointId) {
  const area = document.getElementById(`response-${endpointId}`);
  const content = document.getElementById(`response-${endpointId}-content`);
  if (area) area.classList.remove('active');
  if (content) content.innerHTML = '';
}

/**
 * Generic API call function
 */
async function callApi(endpointId, url) {
  setLoading(endpointId, true);
  try {
    const res = await fetch(url);
    const data = await res.json();
    showResponse(endpointId, data);
  } catch (err) {
    showResponse(endpointId, {
      status: 'error',
      message: `Failed to fetch: ${err.message}`,
    });
  } finally {
    setLoading(endpointId, false);
  }
}

// ===== API Call Functions =====

function callHello() {
  callApi('hello', `${API_BASE}/api/hello`);
}

function callInfo() {
  callApi('info', `${API_BASE}/api/info`);
}

function callGreet() {
  const nameInput = document.getElementById('greet-name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.style.borderColor = '#f5576c';
    nameInput.placeholder = 'Please enter a name!';
    setTimeout(() => {
      nameInput.style.borderColor = '';
      nameInput.placeholder = 'Enter your name...';
    }, 2000);
    return;
  }
  callApi('greet', `${API_BASE}/api/greet/${encodeURIComponent(name)}`);
}

// ===== Auto-load API info on page load =====
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => callInfo(), 300);
});
