/**
 * Retries an async function with exponential backoff.
 * Use this around network calls that can fail transiently
 * (Cloudinary upload, axios requests) - NOT around things like
 * bad input validation, where retrying won't help.
 *
 * @param {Function} fn - async function to run
 * @param {Object} options
 * @param {number} options.retries - max attempts (default 3)
 * @param {number} options.baseDelayMs - initial delay, doubles each retry (default 500ms)
 */
async function retryWithBackoff(fn, { retries = 3, baseDelayMs = 500 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === retries;
      console.warn(`[retry] attempt ${attempt}/${retries} failed: ${err.message}`);

      if (isLastAttempt) break;

      const delay = baseDelayMs * 2 ** (attempt - 1); // 500ms, 1000ms, 2000ms...
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

module.exports = { retryWithBackoff };
