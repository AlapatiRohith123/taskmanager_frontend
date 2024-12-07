import React, { useState } from 'react';


const TaskPage = ({ tasks }) => (
  <div id="task-page" className="task-page">
    <h2 className="task-page-title">Task Details</h2>
    <ul className="task-list">
      {tasks.map((task, index) => (
        <li key={index} className="task-item">
          <strong>Task ID:</strong> {task.taskId} <br />
          <strong>Description:</strong> {task.description} <br />
          <strong>Days Required:</strong> {task.daysRequired} <br />
          <strong>Deadline:</strong> {task.deadline} <br />
          <strong>Dependencies:</strong> {task.dependencies.join(', ') || 'None'}
        </li>
      ))}
    </ul>
  </div>
);


const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [taskId, setTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [daysRequired, setDaysRequired] = useState('');
  const [deadline, setDeadline] = useState('');
  const [dependencies, setDependencies] = useState([]);
  const [availableDependencies, setAvailableDependencies] = useState([]);
  const [error, setError] = useState('');

  const [resultTasks, setResultTasks] = useState(null);
  const [ errorMessage, setErrorMessage] = useState('');


  const handleAddTask = () => {
    if (!taskId || !description || !daysRequired || !deadline) {
      setError('All fields are required');
      return;
    }

    if (tasks.some(task => task.taskId === parseInt(taskId))) {
      setError('Task ID must be unique');
      return;
    }

    const newTask = {
      taskId: parseInt(taskId),
      description,
      daysRequired: parseInt(daysRequired),
      deadline,
      dependencies
    };
    
    setTasks([...tasks, newTask]);
    setAvailableDependencies([...availableDependencies, ...dependencies, parseInt(taskId)]);
    setTaskId('');
    setDescription('');
    setDaysRequired('');
    setDeadline('');
    setDependencies([]);
    setError('');
  };

  const handleDeleteTask = (taskIdToDelete) => {
    setTasks(tasks.filter(task => task.taskId !== taskIdToDelete));
    setAvailableDependencies(availableDependencies.filter(id => id !== taskIdToDelete));
    setDependencies(dependencies.filter(id => id !== taskIdToDelete));
  };

  const handleAddDependency = (depId) => {
    setDependencies([...dependencies, depId]);
    setAvailableDependencies(availableDependencies.filter(id => id !== depId));
  };

  const handleDeleteDependency = (depId) => {
    setDependencies(dependencies.filter(id => id !== depId));
    setAvailableDependencies([...availableDependencies, depId]);
  };

  const handleSubmit = async () => {
    console.log(tasks);
    try {

      const backend=process.env.REACT_APP_BACKEND;
      const response = await fetch(backend, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks),
      });

      const jsonResponse = await response.json();
      console.log(jsonResponse);
      if (response.ok && jsonResponse.status === "Success") {
        console.log(jsonResponse);
        setResultTasks(jsonResponse.data);
        setErrorMessage('');
      } else {
        setErrorMessage(jsonResponse.status);
        setResultTasks(null);
      }
    } catch (error) {
      setErrorMessage('An error occurred while submitting tasks.');
    }
  };

  const onBack=()=>{
    setResultTasks(null);
    setErrorMessage('');
  }
  return (
    <div id="task-manager" className="container">
      {resultTasks || errorMessage ? (
        <div>
        <button
          className="back-button"
          onClick={onBack}
        >
          Back
        </button>
          {errorMessage ? <p className="error-message">{errorMessage}</p> : <TaskPage tasks={resultTasks} />}
        </div>
      ) : (
        <div>
          <h1 className="title">Task Manager</h1>
          
          <div className="form-section">
            <h2 className="subtitle">Add Task</h2>
            {error && <p className="error">{error}</p>}

            <label className="form-label">
              <span className="required-star">*</span> Task ID:
              <input 
                type="number" 
                value={taskId} 
                onChange={(e) => setTaskId(e.target.value)} 
                className="form-input" 
                required
              />
            </label>
            
            <label className="form-label">
              <span className="required-star">*</span> Description:
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="form-input" 
                required
              />
            </label>
            
            <label className="form-label">
              <span className="required-star">*</span> Days Required to Complete:
              <input 
                type="number" 
                value={daysRequired} 
                onChange={(e) => setDaysRequired(e.target.value)} 
                className="form-input" 
                required
              />
            </label>
            
            <label className="form-label">
              <span className="required-star">*</span> Deadline:
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
                className="form-input" 
                required
              />
            </label>
            
            <label className="form-label">
              Dependencies:
              <select 
                onChange={(e) => handleAddDependency(parseInt(e.target.value))} 
                disabled={availableDependencies.length === 0}
                className="form-select"
              >
                <option value="">Select Dependency</option>
                {availableDependencies.map(dep => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </label>

            <ul className="dependencies-list">
              {dependencies.map(dep => (
                <li key={dep} className="dependency-item">
                  {dep} 
                  <button onClick={() => handleDeleteDependency(dep)} className="remove-button">Remove</button>
                </li>
              ))}
            </ul>

            <button onClick={handleAddTask} className="add-button">Add Task</button>
          </div>
          
          <div className="task-list-section">
            <h2 className="subtitle">Tasks</h2>
            <ul className="task-list">
              {tasks.map(task => (
                <li key={task.taskId} className="task-item">
                  <strong>{task.description}</strong> (ID: {task.taskId}, Days Required: {task.daysRequired}, Deadline: {task.deadline})
                  <br />
                  Dependencies: {task.dependencies.join(', ') || 'None'}
                  <br />
                  <button onClick={() => handleDeleteTask(task.taskId)} className="delete-button">Delete Task</button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="submit-section">
            <button onClick={handleSubmit} className="submit-button">Submit</button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Home;
