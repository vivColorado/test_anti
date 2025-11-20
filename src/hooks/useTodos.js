import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map snake_case to camelCase for frontend
      const formattedTodos = data.map(todo => ({
        id: todo.id,
        content: todo.content,
        isDone: todo.is_done,
        createdAt: todo.created_at,
        endedAt: todo.ended_at,
        duration: todo.duration
      }));

      setTodos(formattedTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (content) => {
    try {
      const newTodo = {
        content,
        is_done: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('todos')
        .insert([newTodo])
        .select()
        .single();

      if (error) throw error;

      setTodos([{
        id: data.id,
        content: data.content,
        isDone: data.is_done,
        createdAt: data.created_at,
        endedAt: data.ended_at,
        duration: data.duration
      }, ...todos]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      // Calculate DB updates
      const dbUpdates = {};
      if (updates.content !== undefined) dbUpdates.content = updates.content;

      // Handle status change logic
      const currentTodo = todos.find(t => t.id === id);
      if (!currentTodo) return;

      if (updates.isDone !== undefined) {
        dbUpdates.is_done = updates.isDone;

        if (updates.isDone && !currentTodo.isDone) {
          // Marking as done
          const endedAt = new Date().toISOString();
          dbUpdates.ended_at = endedAt;
          const start = new Date(currentTodo.createdAt).getTime();
          const end = new Date(endedAt).getTime();
          dbUpdates.duration = end - start;
        } else if (!updates.isDone && currentTodo.isDone) {
          // Unmarking
          dbUpdates.ended_at = null;
          dbUpdates.duration = null;
        }
      }

      const { data, error } = await supabase
        .from('todos')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTodos(todos.map(todo => {
        if (todo.id !== id) return todo;
        return {
          id: data.id,
          content: data.content,
          isDone: data.is_done,
          createdAt: data.created_at,
          endedAt: data.ended_at,
          duration: data.duration
        };
      }));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return { todos, addTodo, updateTodo, deleteTodo, loading };
}
