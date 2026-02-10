
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 注意：这里的 base 必须和你的 GitHub 仓库名一致
  // 如果你的仓库是 https://github.com/user/my-repo，这里就写 '/my-repo/'
  base: './', 
});
