import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import NotificationCenter from "./components/NotificationCenter";
import "./App.css";

// Enable cookies for session authentication
axios.defaults.withCredentials = true;

function App() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [types, setTypes] = useState([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [workspaceName, setWorkspaceName] = useState('Notion Workspace');
  const [isLoading, setIsLoading] = useState(true);

  const handleMarkDone = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/tasks', {
        sorts: [{ property: 'Due Date', direction: 'ascending' }]
      });
      const results = response.data.results || [];
      // Map Notion API results to task objects expected by NotificationCenter
      const mappedTasks = results.map(page => {
        const props = page.properties || {};
        return {
          id: page.id,
          name: props.Name?.title?.[0]?.plain_text || 'Untitled',
          due: props['Due Date']?.date?.start || null,
          type: props.Type?.select?.name || 'Unknown',
          typeColor: props.Type?.select?.color || 'default',
          courseName: props.Course?.select?.name || 'Unknown',
          done: props.Done?.checkbox || false,
          worth: props.Worth?.number || 0,
          url: page.url,
          notes: props.Notes?.rich_text?.[0]?.plain_text || '',
          finalExamOver: props['Final Exam Over']?.checkbox || false,
          countdown: null, // Could calculate countdown if needed
        };
      });
      setTasks(mappedTasks);

      // Extract unique courses and types for filters
      const uniqueCourses = [...new Set(mappedTasks.map(t => t.courseName).filter(Boolean))];
      const uniqueTypes = [...new Set(mappedTasks.map(t => t.type).filter(Boolean))];
      setCourses(uniqueCourses);
      setTypes(uniqueTypes);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  useEffect(() => {
    // Directly fetch tasks on component mount, bypassing authentication check.
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const courseMatch = courseFilter === 'all' || task.courseName === courseFilter;
    const typeMatch = typeFilter === 'all' || task.type === typeFilter;
    return courseMatch && typeMatch;
  }), [tasks, courseFilter, typeFilter]);

  if (isLoading) {
    return <div className="App-loader">Loading...</div>;
  }

  return (
    <div className="App">
      <>
        <div className="app-header">
          <span>Workspace: <strong>{workspaceName}</strong></span>
        </div>
        <NotificationCenter
          tasks={filteredTasks}
          courses={courses}
          types={types}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          onMarkDone={handleMarkDone}
          onRefresh={handleRefresh}
        />
      </>
    </div>
  );
};

export default App;
