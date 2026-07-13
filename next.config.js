/** @type {import('next').NextConfig} */
const nextConfig = {
  // Не сообщаем атакующим, что это Next.js (убирает заголовок X-Powered-By).
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  // Глобальные security-заголовки для всех маршрутов (см. skill:
  // performing-security-headers-audit). CSP поставлен в режиме наблюдения
  // (report-only) — см. примечание ниже.
  async headers() {
    const supabaseImg = "https://*.supabase.co https://*.supabase.in";
    const csp = [
      "default-src 'self'",
      // Next.js App Router использует inline-скрипты для RSC-пейлоадов и
      // inline-стили (framer-motion) — поэтому 'unsafe-inline' в style/src.
      // 'wasm-unsafe-eval' нужен Next.js для некоторых оптимизаций.
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: ${supabaseImg}`,
      `font-src 'self' data:`,
      `connect-src 'self' ${supabaseImg}`,
      // Запрещаем встраивание сайта в чужие iframe (защита от clickjacking).
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-src 'none'",
      "manifest-src 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
