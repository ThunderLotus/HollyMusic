## v0.26.6（2026-09-12）

**完整对比**：[v0.26.5 → v0.26.6](https://github.com/redcatH/HollyMusic/compare/v0.26.5...v0.26.6)

### 🐛 问题修复

- **layout**：修复 React error #310 - 将 useAuthStore(isAdmin) 从 JSX 条件中提取到组件顶部
- **auth**：修复登出后页面空白
- **auth**：登录响应补充 isAdmin，修复登录后管理员菜单不显示
- **docker**：npm registry 改为可选 build arg，默认官方源


### ♻️ 重构优化

- **admin**：移除用户管理的「设置密码」按钮


### 🔧 工程与依赖

- **release**：同步 v0.26.5 更新日志与版本号
- **release**：v0.26.6 修复 docker-compose 数据库 volume 路径


