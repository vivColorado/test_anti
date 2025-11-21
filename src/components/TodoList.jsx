import { useMemo } from 'react';
import { TodoItem } from './TodoItem';
import { isSameDay, isSameWeek, isSameMonth, isSameYear, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function TodoList({ todos, onUpdate, onDelete, viewMode }) {
    const groupedTodos = useMemo(() => {
        const groups = {};

        // Sort by creation date descending
        const sorted = [...todos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sorted.forEach(todo => {
            const date = new Date(todo.createdAt);
            let key = '';

            switch (viewMode) {
                case 'day':
                    key = format(date, 'yyyy-MM-dd');
                    break;
                case 'week':
                    key = `第 ${format(date, 'w', { locale: zhCN })} 周, ${format(date, 'yyyy')}`;
                    break;
                case 'month':
                    key = format(date, 'yyyy年 MMMM', { locale: zhCN });
                    break;
                case 'year':
                    key = format(date, 'yyyy年');
                    break;
                default:
                    key = '全部';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(todo);
        });

        return groups;
    }, [todos, viewMode]);

    return (
        <div className="todo-list">
            {Object.entries(groupedTodos).map(([group, items]) => (
                <div key={group} style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                        textAlign: 'left',
                        color: 'var(--color-primary)',
                        borderBottom: '2px solid var(--color-surface)',
                        paddingBottom: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        {viewMode === 'day' ? format(new Date(items[0].createdAt), 'yyyy年M月d日 EEEE', { locale: zhCN }) : group}
                    </h3>
                    <div style={{
                        columnCount: 3,
                        columnGap: '1rem',
                        // Responsive column count could be handled with media queries in CSS, 
                        // but inline styles are limited. We'll stick to a reasonable default 
                        // or use a class if possible. For now, let's use a class or inline media query equivalent?
                        // Since we can't easily do inline media queries, let's use a class in index.css or just style.
                        // Let's use a class 'todo-grid' and define it in index.css for responsiveness.
                    }} className="todo-masonry">
                        {items.map(todo => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            ))}
            {todos.length === 0 && (
                <div style={{ padding: '2rem', color: '#666' }}>
                    暂无待办事项。添加一个来获得多巴胺吧！🚀
                </div>
            )}
        </div>
    );
}
