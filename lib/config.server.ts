// Серверные секреты. Этот файл импортируется ТОЛЬКО в `app/api/chat/route.ts`,
// поэтому ключи никогда не попадают в браузер.
// Рекомендуется задавать ключи через переменные окружения (см. `.env.example`).

// ВСТАВЬТЕ СЮДА ВАШ API-КЛЮЧ DeepSeek (или задайте переменную окружения DEEPSEEK_API_KEY)
const GROQ_API_KEY = ''

// ВСТАВЬТЕ СЮДА ВАШ API-КЛЮЧ Anthropic (или задайте переменную окружения ANTHROPIC_API_KEY)
const ANTHROPIC_API_KEY = ''

export const SERVER_API_KEYS = {
  groq: process.env.GROQ_API_KEY || GROQ_API_KEY,
  claude: process.env.ANTHROPIC_API_KEY || ANTHROPIC_API_KEY,
} as const
