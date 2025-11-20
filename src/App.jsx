import { useState, useEffect } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoList } from './components/TodoList';
import { GanttChart } from './components/GanttChart';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { Plus, LayoutList, BarChart2, LogOut } from 'lucide-react';


function AuthenticatedApp() {
  const [view, setView] = useState('list'); // 'list' or 'gantt'
  const [filterMode, setFilterMode] = useState('day'); // 'day', 'week', 'month', 'year'
  const [newTodoText, setNewTodoText] = useState('');
  const { todos, addTodo, updateTodo, deleteTodo, loading } = useTodos();

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodo(newTodoText);
      setNewTodoText('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--color-text-secondary)'
      }}>
        加载中...
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
          margin: 0
        }}>
          DOPAMINE DO
        </h1>
        <button onClick={handleLogout} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} />
          退出
        </button>
      </header>

      <div className="controls" style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <button
            className={view === 'list' ? 'primary' : ''}
            onClick={() => setView('list')}
            title="列表视图"
          >
            <LayoutList size={20} />
          </button>
          <button
            className={view === 'gantt' ? 'primary' : ''}
            onClick={() => setView('gantt')}
            title="甘特图视图"
          >
            <BarChart2 size={20} />
          </button>
        </div>

        {view === 'list' && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
            {['day', 'week', 'month', 'year'].map(mode => (
              <button
                key={mode}
                className={filterMode === mode ? 'primary' : ''}
                onClick={() => setFilterMode(mode)}
                style={{ textTransform: 'capitalize' }}
              >
                {{ day: '日', week: '周', month: '月', year: '年' }[mode]}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        <input
          type="text"
          placeholder="今天什么能让你快乐？"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="primary">
          <Plus size={24} />
        </button>
      </form>

      <main>
        {view === 'list' ? (
          <TodoList
            todos={todos}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            viewMode={filterMode}
          />
        ) : (
          <GanttChart todos={todos} />
        )}
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!session) {
    return <Auth />;
  }

  return <AuthenticatedApp />;
}

export default App;
