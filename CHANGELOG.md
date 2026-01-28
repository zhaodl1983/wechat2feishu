# Changelog

All notable changes to this project will be documented in this file.

## [V0.6.1] - 2026-01-28

### Added
- **GIF Support**: Full preservation of GIF animations during article capture and rendering.
- **Stats Dashboard**: Real-time public dashboard on the home page showing global archival stats.

### Fixed
- **Emoji Rendering**: Fixed oversized WeChat emojis to ensure they display as inline icons correctly.
- **Dark Mode Polish**: 
  - Unified global background color to #121212.
  - Fixed dark mode styles for the "New Sync" modal and input fields.
- **UI Cleanup**: Removed deprecated Feishu sync buttons and redundant interface elements.

## [V0.6.0] - 2026-01-23

### Added
- **Dark Mode**: Full system-wide dark mode support with:
  - Custom "Apple-style" dark aesthetics (#2C2C2E card backgrounds, #121212 global background).
  - Dynamic Mesh Gradients for both light and dark themes.
  - Manual toggle switch in the dashboard header.
- **Quota Management System**:
  - Implemented per-user storage quota (Default: 20 articles).
  - Visual storage usage indicator in Sidebar with animated progress bar.
  - Server-side enforcement of quota limits during sync requests.
  - "Quota Exceeded" safeguards and user notifications.
- **Dashboard Navigation**:
  - Clicking the "Wechat2doc" logo now reliably navigates to the dashboard (or home) while preserving authentication state.

### Changed
- Updated Sidebar UI to include real-time storage metrics.
- Optimized `HistoryList` component for better dark mode rendering.
- Refined text legibility across all glass-morphism components in dark environments.

## [V0.5.0] - 2026-01-20

### Added
- **MongoDB Integration**: Complete migration from SQLite to MongoDB Replica Set.
- **Data Models**: Enhanced `User` and `Article` schemas for scalability.

## [V0.4.0] - 2026-01-15

### Added
- **SaaS Features**: User authentication, Session management, and Multi-user isolation.
