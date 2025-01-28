import { useVisibility } from '../providers/VisibilityProvider';
import { Scoreboard } from './Scoreboard';

const App: React.FC = () => {
  const { visible } = useVisibility();

  if (!visible) return null;

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-transparent dark">
      <Scoreboard />
    </div>
  );
};

export default App;
