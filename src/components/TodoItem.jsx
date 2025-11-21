import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { format } from 'date-fns';
import { Check, Trash2, Calendar, Clock, AlertCircle, X } from 'lucide-react';
import { zhCN } from 'date-fns/locale';

export function TodoItem({ todo, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(todo.content);
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        if (isEditing && textareaRef.current) {
            // Reset height to auto to get the correct scrollHeight for shrinking
            textareaRef.current.style.height = 'inherit'; // Use inherit to start
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = scrollHeight + 'px';
        }
    }, [isEditing, editContent]);

    const handleSaveContent = () => {
        if (editContent.trim() && editContent !== todo.content) {
            onUpdate(todo.id, { content: editContent });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveContent();
        }
        if (e.key === 'Escape') {
            setEditContent(todo.content);
            setIsEditing(false);
        }
    };

    const toggleDeadline = (e) => {
        e.stopPropagation();
        if (todo.deadline) {
            onUpdate(todo.id, { deadline: null });
        } else {
            // Default to tomorrow 18:00
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(18, 0, 0, 0);
            onUpdate(todo.id, { deadline: tomorrow.toISOString() });
        }
    };

    const commonTextStyle = {
        width: '100%',
        fontFamily: 'inherit',
        fontSize: '1rem',
        lineHeight: '1.5', // Increased slightly for better readability and matching
        padding: '0.3rem', // Consistent padding
        boxSizing: 'border-box',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap', // Preserve newlines in read mode too
        minHeight: '1.5em'
    };

    return (
        <div className={`todo-item card ${todo.isDone ? 'done' : ''}`} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '1rem',
            breakInside: 'avoid',
            borderColor: todo.isDone ? 'var(--color-accent)' : 'inherit',
            opacity: todo.isDone ? 0.8 : 1,
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.5rem' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate(todo.id, { isDone: !todo.isDone }); }}
                    style={{
                        padding: '0',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: todo.isDone ? 'var(--color-accent)' : 'transparent',
                        border: '2px solid var(--color-accent)',
                        color: '#000',
                        marginTop: '0.2rem',
                        cursor: 'pointer'
                    }}
                >
                    {todo.isDone && <Check size={14} />}
                </button>

                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    {isEditing ? (
                        <textarea
                            ref={textareaRef}
                            autoFocus
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onBlur={handleSaveContent}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            rows={1}
                            style={{
                                ...commonTextStyle,
                                resize: 'none',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                outline: 'none',
                                color: 'inherit',
                                overflow: 'hidden',
                            }}
                        />
                    ) : (
                        <div
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            style={{
                                ...commonTextStyle,
                                textDecoration: todo.isDone ? 'line-through' : 'none',
                                cursor: 'text',
                                border: '1px solid transparent', // Placeholder border to match textarea
                                borderRadius: '4px',
                            }}
                            title="点击编辑"
                        >
                            {todo.content}
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
                    style={{
                        color: 'var(--color-danger)',
                        padding: '0',
                        border: 'none',
                        background: 'transparent',
                        boxShadow: 'none',
                        opacity: 0.4,
                        cursor: 'pointer',
                        transform: 'none'
                    }}
                    title="删除"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#888',
                marginTop: '0.5rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                alignItems: 'center'
            }}>
                <DateEditor
                    date={todo.createdAt}
                    icon={<Calendar size={12} />}
                    onSave={(date) => onUpdate(todo.id, { createdAt: date })}
                />

                {todo.isDone && (
                    <>
                        <DateEditor
                            date={todo.endedAt}
                            icon={<Check size={12} />}
                            color="var(--color-accent)"
                            onSave={(date) => onUpdate(todo.id, { endedAt: date })}
                        />
                        {todo.duration && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-secondary)' }} title="用时">
                                <Clock size={12} />
                                <span>{formatDuration(todo.duration)}</span>
                            </div>
                        )}
                    </>
                )}

                {!todo.deadline ? (
                    <button
                        onClick={toggleDeadline}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            cursor: 'pointer',
                            color: '#666',
                            boxShadow: 'none',
                            transform: 'none'
                        }}
                        title="添加截止时间"
                    >
                        <AlertCircle size={12} />
                        <span>+</span>
                    </button>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0 0.3rem', borderRadius: '4px' }}>
                        <DateEditor
                            date={todo.deadline}
                            icon={<AlertCircle size={12} />}
                            color="#f59e0b"
                            onSave={(date) => onUpdate(todo.id, { deadline: date })}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); onUpdate(todo.id, { deadline: null }); }}
                            style={{ border: 'none', background: 'none', padding: 0, color: '#666', cursor: 'pointer', display: 'flex', boxShadow: 'none', transform: 'none' }}
                            title="移除截止时间"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DateEditor({ date, icon, onSave, color }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempDate, setTempDate] = useState('');

    const startEditing = (e) => {
        e.stopPropagation();
        setTempDate(format(new Date(date), "yyyy-MM-dd'T'HH:mm"));
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.stopPropagation();
        if (tempDate) {
            onSave(new Date(tempDate).toISOString());
        }
        setIsEditing(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'var(--color-surface)', padding: '0', borderRadius: '4px', zIndex: 10, position: 'relative' }}
            >
                <input
                    type="datetime-local"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    style={{
                        fontSize: '0.75rem',
                        padding: '0.1rem',
                        border: '1px solid #444',
                        borderRadius: '2px',
                        background: '#222',
                        color: '#fff',
                        width: 'auto'
                    }}
                />
                <button
                    onClick={handleSave}
                    style={{ padding: '0.1rem', background: 'var(--color-accent)', border: 'none', borderRadius: '2px', color: '#000', display: 'flex', minWidth: 'auto', height: 'auto', boxShadow: 'none', transform: 'none' }}
                >
                    <Check size={12} />
                </button>
                <button
                    onClick={handleCancel}
                    style={{ padding: '0.1rem', background: '#444', border: 'none', borderRadius: '2px', color: '#fff', display: 'flex', minWidth: 'auto', height: 'auto', boxShadow: 'none', transform: 'none' }}
                >
                    <X size={12} />
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={startEditing}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: color || 'inherit',
                cursor: 'pointer',
                padding: '0.1rem 0.2rem',
                borderRadius: '4px',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap'
            }}
            title={format(new Date(date), "yyyy-MM-dd HH:mm")}
        >
            {icon}
            <span>{format(new Date(date), "M/d HH:mm")}</span>
        </div>
    );
}

function formatDuration(ms) {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天${hours % 24}h`;
    if (hours > 0) return `${hours}h${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}
