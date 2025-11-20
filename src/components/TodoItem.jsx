import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Check, Trash2, Calendar, Clock } from 'lucide-react';
import { zhCN } from 'date-fns/locale';

export function TodoItem({ todo, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(todo.content);

    const handleSave = () => {
        if (editContent.trim()) {
            onUpdate(todo.id, { content: editContent });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditContent(todo.content);
            setIsEditing(false);
        }
    };

    const handleDateChange = (e) => {
        if (!e.target.value) return;
        try {
            const newDate = new Date(e.target.value).toISOString();
            onUpdate(todo.id, { createdAt: newDate });
        } catch (error) {
            console.error("Invalid date", error);
        }
    };

    return (
        <div className={`todo-item card ${todo.isDone ? 'done' : ''}`} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '1rem',
            borderColor: todo.isDone ? 'var(--color-accent)' : 'inherit',
            opacity: todo.isDone ? 0.8 : 1
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => onUpdate(todo.id, { isDone: !todo.isDone })}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: todo.isDone ? 'var(--color-accent)' : 'transparent',
                        border: '2px solid var(--color-accent)',
                        color: '#000'
                    }}
                >
                    {todo.isDone && <Check size={20} />}
                </button>

                <div style={{ flex: 1, textAlign: 'left' }}>
                    {isEditing ? (
                        <input
                            autoFocus
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            style={{ width: '100%' }}
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditing(true)}
                            style={{
                                fontSize: '1.2rem',
                                textDecoration: todo.isDone ? 'line-through' : 'none',
                                cursor: 'pointer',
                                display: 'block'
                            }}
                        >
                            {todo.content}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => onDelete(todo.id)}
                    style={{ color: 'var(--color-danger)', padding: '0.5rem', border: 'none', boxShadow: 'none' }}
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.8rem',
                color: '#888',
                marginTop: '0.5rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} />
                    <label style={{ cursor: 'pointer' }}>
                        创建于:
                        <input
                            type="datetime-local"
                            value={format(new Date(todo.createdAt), "yyyy-MM-dd'T'HH:mm")}
                            onChange={handleDateChange}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit',
                                fontSize: 'inherit',
                                width: 'auto',
                                padding: 0,
                                marginLeft: '0.3rem'
                            }}
                        />
                    </label>
                </div>

                {todo.isDone && todo.endedAt && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-accent)' }}>
                            <Check size={14} />
                            <span>完成于: {format(new Date(todo.endedAt), "M月d日 HH:mm", { locale: zhCN })}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-secondary)' }}>
                            <Clock size={14} />
                            <span>用时: {formatDuration(todo.duration)}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function formatDuration(ms) {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天 ${hours % 24}小时`;
    if (hours > 0) return `${hours}小时 ${minutes % 60}分`;
    if (minutes > 0) return `${minutes}分`;
    return `${seconds}秒`;
}
