import React from 'react';
import { GameProvider } from './context/GameContext';
import Menu from './components/Menu';
import RoomSetup from './components/RoomSetup';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = React.useState('menu');
  const [gameMode, setGameMode] = React.useState(null);

  const navigateToScreen = (screen, mode = null) => {
    setCurrentScreen(screen);
    if (mode) setGameMode(mode);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <Menu onModeSelect={(mode) => navigateToScreen('roomSetup', mode)} />;
      case 'roomSetup':
        return <RoomSetup 
          gameMode={gameMode} 
          onGameStart={() => navigateToScreen('game')} 
          onBack={() => navigateToScreen('menu')}
        />;
      case 'game':
        return <GameBoard 
          gameMode={gameMode} 
          onGameEnd={() => navigateToScreen('result')} 
        />;
      case 'result':
        return <ResultScreen onRestart={() => navigateToScreen('menu')} />;
      default:
        return <Menu onModeSelect={(mode) => navigateToScreen('roomSetup', mode)} />;
    }
  };

  return (
    <GameProvider>
      <div className="App">
        <header className="app-header">
          <h1>Jujutsu Kaisen Clash</h1>
        </header>
        <main className="app-main">
          {renderScreen()}
        </main>
      </div>
    </GameProvider>
  );
}

export default App;