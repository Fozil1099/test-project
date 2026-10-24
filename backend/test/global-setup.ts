import { execSync } from 'node:child_process';
import './set-env';

export default function globalSetup(): void {
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
}
