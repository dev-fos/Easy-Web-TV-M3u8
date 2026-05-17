![Easy-Web-TV](images/banner.jpg)

# Easy-Web-TV-M3u8

[![Issues](https://img.shields.io/github/issues/zhangboheng/Easy-Web-TV-M3u8)](https://github.com/zhangboheng/Easy-Web-TV-M3u8/issues)
[![Forks](https://img.shields.io/github/forks/zhangboheng/Easy-Web-TV-M3u8)](https://github.com/zhangboheng/Easy-Web-TV-M3u8/network/members)
[![Stars](https://img.shields.io/github/stars/zhangboheng/Easy-Web-TV-M3u8)](https://github.com/zhangboheng/Easy-Web-TV-M3u8/stargazers)
[![License](https://img.shields.io/github/license/zhangboheng/Easy-Web-TV-M3u8)](https://github.com/zhangboheng/Easy-Web-TV-M3u8/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-8.2.3-green)](https://github.com/zhangboheng/Easy-Web-TV-M3u8)

An all-in-one web entertainment platform to watch TV, movies, series, anime, shows, listen to music and radio, read novels and manga, and play games - all in one place.

## 📋 Table of Contents

- [Demo](#-demo)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Sponsor](#-sponsor)
- [Thanks](#-thanks)
- [License](#-license)

## 🎬 Demo

**[Live Demo](https://zhangboheng.github.io/Easy-Web-TV-M3u8/)**

## ✨ Features

### 📺 TV & IPTV
- Watch 6000+ TV channels from around the world
- Filter by country, language, and category
- Support for M3U8 video links
- Favorite channels for quick access

### 🎬 Movies & Series
- Search and watch movies, series, animes, and shows
- Multiple source options
- Favorites and watch history

### 🎵 Music & Radio
- Search and listen to music
- Access 28000+ radio stations worldwide
- Radio station search by name, country, language

### 📖 Reading
- Search and read novels/books
- Search and read manga
- Reading progress tracking
- Chapter navigation

### 🎮 Games
- Built-in mini games
- Square Obstacles, Pong, Breakout, Tic Tac Toe
- Fullscreen game mode

### 🔧 Other Features
- 🌐 Multi-language support
- ⭐ Favorites system for all content types
- 🔍 Powerful search functionality
- 📱 Responsive design for mobile devices
- 🎨 Modern dark theme UI
- 🔒 Sensitive content filter (adult content)

## 📸 Screenshots

### Homepage

![Homepage](images/example.jpg)

### TV

![TV](images/tvchannels.jpg)

### Novel

![Novel](images/novelchannels.jpg)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Library**: jQuery 3.6.0
- **Video Player**: Video.js
- **Image Viewer**: Spotlight.js
- **APIs**:
  - [iptv-org](https://github.com/iptv-org/iptv) - TV channels
  - [Radiobrowser](https://github.com/segler-alex/radiobrowser-api-rust) - Radio stations

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zhangboheng/Easy-Web-TV-M3u8.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Easy-Web-TV-M3u8
   ```

3. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

4. Open `http://localhost:8000` in your browser

## 📁 Project Structure

```
Easy-Web-TV-M3u8/
├── index.html              # Main entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── main.css           # Main styles
│   └── style.css          # Additional styles
├── js/
│   ├── index.js           # Main JavaScript
│   ├── catalogues.js      # Catalogue functions
│   ├── translator.js      # Translation handler
│   └── ...                # Other modules
├── routes/
│   ├── tv.html            # TV page
│   ├── movie.html         # Movie page
│   ├── music.html         # Music page
│   ├── radio.html         # Radio page
│   ├── novel.html         # Novel page
│   ├── manga.html         # Manga page
│   ├── game.html          # Game page
│   └── ...                # Other pages
├── catalogues/
│   └── *play.html         # Player pages
├── gamebox/
│   └── ...                # Mini games
└── images/
    └── ...                # Image assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ☕ Sponsor

[![Buy Me A Coffee](images/buymecoffeesponsor.jpeg)](https://www.buymeacoffee.com/zhangboheng)

If you like this project, consider buying me a coffee! ☕

## 🙏 Thanks

This project uses the following open source projects:

- [jQuery](https://github.com/jquery/jquery) - JavaScript library
- [iptv-org](https://github.com/iptv-org/iptv) - IPTV channels database
- [Radiobrowser](https://github.com/segler-alex/radiobrowser-api-rust) - Radio stations API
- [Video.js](https://github.com/videojs/video.js) - Video player
- [Spotlight.js](https://github.com/nextapps-de/spotlight) - Image viewer
- [Font Awesome](https://fontawesome.com/) - Icons

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications of those files under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.

---

Made with ❤️ by [Zhang Boheng](https://github.com/zhangboheng)
