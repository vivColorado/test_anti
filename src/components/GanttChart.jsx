import { useState, useMemo } from 'react';
import { format, differenceInHours, differenceInDays, addHours, addDays, startOfDay, endOfDay, min, max } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function GanttChart({ todos }) {
    const [zoom, setZoom] = useState('day'); // 'hour', 'day'

    const { minDate, maxDate, totalDuration } = useMemo(() => {
        if (todos.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDuration: 0 };

        const dates = todos.flatMap(t => [
            new Date(t.createdAt),
            t.endedAt ? new Date(t.endedAt) : new Date()
        ]);

        const minD = min(dates);
        const maxD = max(dates);

        // Add some padding
        const start = startOfDay(minD);
        const end = endOfDay(maxD);

        return {
            minDate: start,
            maxDate: end,
            totalDuration: differenceInHours(end, start)
        };
    }, [todos]);

    const getPosition = (date) => {
        const hours = differenceInHours(new Date(date), minDate);
        return (hours / totalDuration) * 100;
    };

    const getWidth = (start, end) => {
        const hours = differenceInHours(new Date(end || new Date()), new Date(start));
        // Minimum width for visibility
        return Math.max((hours / totalDuration) * 100, 0.5);
    };

    return (
        <div className="gantt-chart" style={{
            marginTop: '2rem',
            background: 'var(--color-surface)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            overflowX: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>甘特图时间轴</h3>
                {/* Zoom controls could go here, but for now we just auto-scale */}
            </div>

            <div style={{ position: 'relative', minHeight: '200px', minWidth: '100%' }}>
                {/* Time Axis */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #444',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    color: '#888'
                }}>
                    <span>{format(minDate, 'M月d日', { locale: zhCN })}</span>
                    <span>{format(maxDate, 'M月d日', { locale: zhCN })}</span>
                </div>

                {/* Tasks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {todos.map(todo => {
                        const left = getPosition(todo.createdAt);
                        const width = getWidth(todo.createdAt, todo.endedAt);

                        return (
                            <div key={todo.id} style={{ position: 'relative', height: '30px', width: '100%' }}>
                                <div
                                    title={`${todo.content} (${format(new Date(todo.createdAt), 'HH:mm')} - ${todo.endedAt ? format(new Date(todo.endedAt), 'HH:mm') : '现在'})`}
                                    style={{
                                        position: 'absolute',
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        height: '100%',
                                        backgroundColor: todo.isDone ? 'var(--color-accent)' : 'var(--color-primary)',
                                        borderRadius: 'var(--radius-sm)',
                                        opacity: 0.8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 0.5rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        fontSize: '0.8rem',
                                        color: '#000',
                                        fontWeight: 'bold',
                                        boxShadow: todo.isDone ? 'none' : '0 0 10px var(--color-primary)'
                                    }}
                                >
                                    {todo.content}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Current Time Indicator */}
                <div style={{
                    position: 'absolute',
                    left: `${getPosition(new Date())}%`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'var(--color-secondary)',
                    zIndex: 10,
                    pointerEvents: 'none'
                }} />
            </div>
        </div>
    );
}
