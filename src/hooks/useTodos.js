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
        duration: todo.duration,
        deadline: todo.deadline
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
        duration: data.duration,
        deadline: data.deadline
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
      if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
      if (updates.endedAt !== undefined) dbUpdates.ended_at = updates.endedAt;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

      // Handle status change logic
      const currentTodo = todos.find(t => t.id === id);
      if (!currentTodo) return;

      if (updates.isDone !== undefined) {
        dbUpdates.is_done = updates.isDone;

        if (updates.isDone && !currentTodo.isDone) {
          // Marking as done
          // Only set endedAt if not provided in updates
          if (updates.endedAt === undefined) {
            const endedAt = new Date().toISOString();
            dbUpdates.ended_at = endedAt;
          }
        } else if (!updates.isDone && currentTodo.isDone) {
          // Unmarking
          dbUpdates.ended_at = null;
          dbUpdates.duration = null;
        }
      }

      // Recalculate duration if times changed or status changed
      if (dbUpdates.created_at || dbUpdates.ended_at || (dbUpdates.is_done !== undefined)) {
        const start = new Date(dbUpdates.created_at || currentTodo.createdAt).getTime();
        const endStr = dbUpdates.ended_at !== undefined ? dbUpdates.ended_at : currentTodo.endedAt;

        if (endStr) {
          const end = new Date(endStr).getTime();
          dbUpdates.duration = end - start;
        } else {
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
          duration: data.duration,
          deadline: data.deadline
        };
      }));
    } catch (error) {
      console.error('Error updating todo:', error);
      if (error.message?.includes('column "deadline" does not exist')) {
        console.error('The "deadline" column is missing in your Supabase table. Please run: alter table todos add column if not exists deadline timestamptz;');
      }
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
