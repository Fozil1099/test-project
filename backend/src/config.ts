export const appConfig = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  /** Time zone that defines "today" and month boundaries for students' createdAt. */
  timeZone: process.env.APP_TIMEZONE ?? 'Asia/Tashkent',
};
