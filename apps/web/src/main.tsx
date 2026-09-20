import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Bell, ChevronDown, Gamepad2, Menu, Search, Sparkles, Users } from 'lucide-react';
import { createGameCatalog, gameCategories, type GameCategory } from '@cozyt/core';
import './styles.css';

const catalog = createGameCatalog();

function App() {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const games = catalog.list(selectedCategory === 'all' ? undefined : { category: selectedCategory });
  const featuredGame = games.find((game) => game.availability === 'available') ?? games[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CozyT home">
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.4} /></span>
          <span>CozyT</span>
        </a>
        <nav className={showMobileNav ? 'main-nav is-open' : 'main-nav'} aria-label="メインナビゲーション">
          <a className="active" href="#discover">Discover</a>
          <a href="#rooms">Rooms</a>
          <a href="#about">About</a>
        </nav>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="通知"><Bell size={18} /></button>
          <button className="profile-button"><span className="avatar">CT</span><span className="profile-name">Guest</span><ChevronDown size={15} /></button>
          <button className="menu-button icon-button" aria-label="メニュー" onClick={() => setShowMobileNav(!showMobileNav)}><Menu size={20} /></button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" id="discover">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> COZY TADOKORO YAJU PLAYGROUND</p>
            <h1>Cozy<em>T</em> Portal </h1>
            <p className="hero-description">友だちと集まって、まだ知らない遊びに出会う。CozyTは、気軽なゲームの時間をつくる場所です。</p>
            <div className="hero-actions">
              <a className="primary-button" href="#games">ゲームを探す <ArrowUpRight size={17} /></a>
              <button className="text-button"><Gamepad2 size={17} /> ルームを作る</button>
            </div>
          </div>
        </section>

        <section className="section-block" id="games">
          <div className="section-heading">
            <div><p className="eyebrow">THE COLLECTION</p><h2>ゲームを選ぶ</h2></div>
            <button className="browse-button">すべて見る <ArrowUpRight size={16} /></button>
          </div>
          <div className="filter-row" role="group" aria-label="ゲームカテゴリ">
            <button className={selectedCategory === 'all' ? 'filter active' : 'filter'} onClick={() => setSelectedCategory('all')}>All games</button>
            {gameCategories.map((category) => <button key={category.id} className={selectedCategory === category.id ? 'filter active' : 'filter'} onClick={() => setSelectedCategory(category.id)}>{category.label}</button>)}
          </div>
          <div className="games-layout">
            {featuredGame && <article className="featured-game" style={{ '--accent': featuredGame.accent } as React.CSSProperties}>
              <div className="game-badge">FEATURED</div><div className="featured-icon">{featuredGame.icon}</div>
              <div className="featured-bottom"><div><h3>{featuredGame.name}</h3><p>{featuredGame.description}</p></div><a className="circle-arrow" href="#rooms" aria-label="ルームへ"><ArrowUpRight size={20} /></a></div>
            </article>}
            <div className="game-list">{games.filter((game) => game.id !== featuredGame?.id).map((game) => <article className="game-row" key={game.id}>
              <div className="game-icon" style={{ backgroundColor: game.accent }}>{game.icon}</div><div className="game-info"><div className="game-title-line"><h3>{game.name}</h3>{game.availability === 'coming-soon' && <span className="status-pill">SOON</span>}</div><p>{game.description}</p></div><span className="player-count"><Users size={14} /> {game.players.min}-{game.players.max}</span>
            </article>)}</div>
          </div>
        </section>

        <section className="join-strip" id="rooms"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>ひと息ついて、遊ぼう。</h2></div><button className="dark-button">Discordとつなぐ <ArrowUpRight size={17} /></button></section>
      </main>
      <footer id="about"><span>© 2026 CozyT</span><span>Made for slow evenings & good company.</span><span className="footer-search"><Search size={15} /> Search games</span></footer>
    </div>
  );
}

export default App;

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('The application root element was not found.');
}

createRoot(rootElement).render(<App />);
