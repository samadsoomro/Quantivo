const fs = require('fs');

function applyConditional(filePath, rewrites) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Add isGuest check
  if (!code.includes('const isGuest =')) {
    code = code.replace(/export default function \w+\(\) \{/, (match) => {
      return match + `\n  const isGuest = typeof window !== 'undefined' && localStorage.getItem('qv-guest-mode') === 'true'\n`;
    });
  }

  for (const { target, guestCode, supabasePrefix } of rewrites) {
    if (code.includes(guestCode)) continue; // already applied
    
    // We want to replace the body of the function.
    // We assume the target matches the start of the function, and we'll manually wrap the existing code in `else { ... }`.
    // But it's easier to just use string replacement on the exact function definition if we know it.
  }
}
