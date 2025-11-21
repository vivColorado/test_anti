import { useState, useMemo } from 'react';
import { format, differenceInHours, startOfDay, endOfDay, min, max, addDays, addWeeks, addMonths, isSameDay, isSameMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ZoomIn, ZoomOut, Maximize, CalendarDays, CalendarRange } from 'lucide-react';

export function GanttChart({ todos }) {
    const [viewMode, setViewMode] = useState('fit'); // 'fit', 'day', 'week', 'month'

    const { minDate, maxDate, totalDuration } = useMemo(() => {
        if (todos.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDuration: 0 };

        const dates = todos.flatMap(t => {
            const d = [new Date(t.createdAt)];
            if (t.endedAt) d.push(new Date(t.endedAt));
            if (t.deadline) d.push(new Date(t.deadline));
            if (!t.endedAt) d.push(new Date());
            return d;
        });

        const minD = min(dates);
        const maxD = max(dates);

        // Add padding
        const start = startOfDay(minD);
        const end = endOfDay(maxD);

        return {
            minDate: start,
            maxDate: end,
            totalDuration: Math.max(differenceInHours(end, start), 24) // Min 24 hours
        };
    }, [todos]);

    // Calculate pixels per hour based on view mode
    const pixelsPerHour = useMemo(() => {
        switch (viewMode) {
            case 'day': return 10; // 240px per day
            case 'week': return 2; // 48px per day
            case 'month': return 0.5; // 12px per day
            default: return 0; // Fit mode
        }
    }, [viewMode]);

    const containerWidth = useMemo(() => {
        if (viewMode === 'fit') return '100%';
        return `${totalDuration * pixelsPerHour}px`;
    }, [viewMode, totalDuration, pixelsPerHour]);

    const getPosition = (date) => {
        const hours = differenceInHours(new Date(date), minDate);
        if (viewMode === 'fit') {
            return (hours / totalDuration) * 100 + '%';
        }
        return `${hours * pixelsPerHour}px`;
    };

    const getWidth = (start, end) => {
        const s = new Date(start);
        const e = end ? new Date(end) : new Date();
        let hours = differenceInHours(e, s);
        if (hours < 1) hours = 1; // Min width

        if (viewMode === 'fit') {
            return (hours / totalDuration) * 100 + '%';
        }
        return `${hours * pixelsPerHour}px`;
    };

    // Generate time markers based on view mode
    const markers = useMemo(() => {
        if (viewMode === 'fit') return [];
        const marks = [];
        let current = minDate;

        if (viewMode === 'day') {
            // Show every day
            while (current <= maxDate) {
                marks.push({ date: current, label: format(current, 'M/d') });
                current = addDays(current, 1);
            }
        } else if (viewMode === 'week') {
            // Show every day but maybe less prominent, or every 2 days?
            // Let's show every day but label only Mondays or just dates
            while (current <= maxDate) {
                marks.push({ date: current, label: format(current, 'd') });
                current = addDays(current, 1);
            }
        } else if (viewMode === 'month') {
            // Show every week or every few days
            while (current <= maxDate) {
                // Mark start of weeks or just every 5 days
                if (current.getDate() === 1 || current.getDay() === 1) {
                    marks.push({ date: current, label: format(current, 'M/d') });
                } else {
                    marks.push({ date: current, label: '', isMinor: true });
                }
                current = addDays(current, 1);
            }
        }
        return marks;
    }, [minDate, maxDate, viewMode]);

    return (
        <div className="gantt-chart" style={{
            marginTop: '2rem',
            background: 'var(--color-surface)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>甘特图时间轴</h3>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#222', padding: '0.2rem', borderRadius: '4px' }}>
                    <button
                        onClick={() => setViewMode('fit')}
                        className={viewMode === 'fit' ? 'primary' : ''}
                        style={{ padding: '0.3rem', borderRadius: '2px', border: 'none' }}
                        title="自适应"
                    >
                        <Maximize size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        className={viewMode === 'month' ? 'primary' : ''}
                        style={{ padding: '0.3rem', borderRadius: '2px', border: 'none' }}
                        title="月视图 (缩小)"
                    >
                        <CalendarRange size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={viewMode === 'week' ? 'primary' : ''}
                        style={{ padding: '0.3rem', borderRadius: '2px', border: 'none' }}
                        title="周视图"
                    >
                        <CalendarDays size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('day')}
                        className={viewMode === 'day' ? 'primary' : ''}
                        style={{ padding: '0.3rem', borderRadius: '2px', border: 'none' }}
                        title="日视图 (放大)"
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>
            </div>

            <div style={{
                overflowX: 'auto',
                position: 'relative',
                minHeight: '200px',
                border: '1px solid #333',
                borderRadius: '4px',
                background: '#1a1a1a'
            }}>
                <div style={{
                    position: 'relative',
                    width: containerWidth,
                    minWidth: '100%',
                    height: '100%',
                    padding: '2rem 0 1rem 0'
                }}>
                    {/* Grid Lines & Markers */}
                    {viewMode !== 'fit' && markers.map((mark, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: getPosition(mark.date),
                            top: 0,
                            bottom: 0,
                            borderLeft: mark.isMinor ? '1px dashed #2a2a2a' : '1px solid #333',
                            pointerEvents: 'none'
                        }}>
                            {mark.label && (
                                <span style={{
                                    position: 'absolute',
                                    top: '0.2rem',
                                    left: '0.2rem',
                                    fontSize: '0.7rem',
                                    color: '#666',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {mark.label}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Axis Labels for Fit Mode */}
                    {viewMode === 'fit' && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            position: 'absolute',
                            top: '0.5rem',
                            left: 0,
                            right: 0,
                            padding: '0 1rem',
                            fontSize: '0.8rem',
                            color: '#888'
                        }}>
                            <span>{format(minDate, 'M月d日', { locale: zhCN })}</span>
                            <span>{format(maxDate, 'M月d日', { locale: zhCN })}</span>
                        </div>
                    )}

                    {/* Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', padding: '0 1rem' }}>
                        {todos.map(todo => {
                            const left = getPosition(todo.createdAt);
                            const width = getWidth(todo.createdAt, todo.endedAt);

                            return (
                                <div key={todo.id} style={{ position: 'relative', height: '30px', width: '100%' }}>
                                    <div
                                        title={`${todo.content} (${format(new Date(todo.createdAt), 'HH:mm')} - ${todo.endedAt ? format(new Date(todo.endedAt), 'HH:mm') : '现在'})`}
                                        style={{
                                            position: 'absolute',
                                            left: left,
                                            width: width,
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
                                            boxShadow: todo.isDone ? 'none' : '0 0 10px var(--color-primary)',
                                            zIndex: 2
                                        }}
                                    >
                                        {todo.content}
                                    </div>
                                    {/* Deadline Marker */}
                                    {todo.deadline && (
                                        <div
                                            title={`截止: ${format(new Date(todo.deadline), 'M月d日 HH:mm')}`}
                                            style={{
                                                position: 'absolute',
                                                left: getPosition(todo.deadline),
                                                top: 0,
                                                bottom: 0,
                                                width: '2px',
                                                background: 'red',
                                                zIndex: 3
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Time Indicator */}
                    <div style={{
                        position: 'absolute',
                        left: getPosition(new Date()),
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        backgroundColor: 'var(--color-secondary)',
                        zIndex: 10,
                        pointerEvents: 'none',
                        boxShadow: '0 0 5px var(--color-secondary)'
                    }} />
                </div>
            </div>
        </div>
    );
}
