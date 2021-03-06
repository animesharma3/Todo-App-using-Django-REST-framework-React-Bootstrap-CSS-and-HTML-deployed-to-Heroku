import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

// const App = () => {
//   const [todoList, setTodoList] = useState([])

//   useEffect(() => {
//     const fetchTasks = async () => {
//       let url = 'https://justdothething.herokuapp.com/api/task-list/'
//       await fetch(url)
//       .then(res => res.json())
//       .then(data => setTodoList(data))
//     }
//     fetchTasks()
//   })

//   return (
//     <div className="container">
//       <div id="task-container">
//         <div id="form-wrapper">
//           <form id="form">
//             <div className="flex-wrapper">
//               <div style={{ flex: 6 }}>
//                 <input className="form-control" id="title" type='text' name='title' placeholder='Add Task'></input>
//               </div>
//               <div style={{ flex: 1 }}>
//                 <input className="btn btn-warning" name='Add' id='submit' type='submit'></input>
//               </div>
//             </div>
//           </form>
//         </div>
//         <div id="list-wrapper">
//           {
//             todoList.map(task => {
//               return (
//                 <div className="task-wrapper flex-wrapper" key={task.id}>
//                   <div style={{ flex:7 }}>
//                     <span>{task.title}</span>
//                   </div>
//                   <div style={{ flex:1 }}>
//                     <button className='btn btn-sm btn-outline-info'>Edit</button>
//                   </div>
//                   <div style={{ flex:1 }}>
//                     <button className='btn btn-sm btn-outline-dark delete'>Delete</button>
//                   </div>
//                 </div>
//               )
//             })
//           }
//         </div>
//       </div>
//     </div>
//   )
// }

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: '',
        completed: false
      },
      editing: false,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie  = this.getCookie.bind(this)
    this.deleteItem  = this.deleteItem.bind(this)
    this.startEdit  = this.startEdit.bind(this)
    this.strikeUnstrike  = this.strikeUnstrike.bind(this)
  }

  getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              // Does this cookie string begin with the name we want?
              if (cookie.substring(0, name.length + 1) === (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
  }

  componentWillMount() {
    this.fetchTasks()
  }

  fetchTasks() {
    console.log('Fetching.....')
    fetch('https://justdothething.herokuapp.com/api/task-list/')
    .then(response => response.json())
    .then(data => this.setState({
      todoList: data
    }))
  }

  handleChange(e) {
    let name = e.target.name
    let value = e.target.value

    this.setState({
      activeItem: {
        ...this.state.activeItem, title:value
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()

    let csrftoken = this.getCookie('csrftoken')
    let url = 'https://justdothething.herokuapp.com/api/task-create/'

    if (this.state.editing === true) {
      url = `https://justdothething.herokuapp.com/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false
      })
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(this.state.activeItem)
    })
    .then(res => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          completed: false
        }
      })
    })
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true
    })
  }

  strikeUnstrike(task) {
    task.completed = !task.completed
    let csrftoken = this.getCookie('csrftoken')
    let url = `https://justdothething.herokuapp.com/api/task-update/${task.id}/`
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({
        'completed': task.completed,
        'title': task.title
      })
    })
    .then(res => {
      this.fetchTasks()
    })
  }

  deleteItem(task) {
    let csrftoken = this.getCookie('csrftoken')
    let url = `https://justdothething.herokuapp.com/api/task-delete/${task.id}/`
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken
      },
    })
    .then(res => {
      this.fetchTasks()
    })
  }

  render() {
    let tasks = this.state.todoList
    let self = this

    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input onChange={this.handleChange} className="form-control" id="title" value={ this.state.activeItem.title } type='text' name='title' placeholder='Add Task'></input>
                </div>
                <div style={{ flex: 1 }}>
                  <input className="btn btn-warning" name='Add' id='submit' type='submit'></input>
                </div>
              </div>
            </form>
          </div>
          <div id="list-wrapper">
            { tasks.map(function(task, index) {
              return (
                <div className="task-wrapper flex-wrapper" key={index}>
                  <div onClick={() => self.strikeUnstrike(task)} style={{ flex:7 }}>
                    {
                      task.completed == false ? (<span>{task.title}</span>) : (<strike>{task.title}</strike>)
                    }
                  </div>
                  <div style={{ flex:1 }}>
                    <button onClick={() => self.startEdit(task)} className='btn btn-sm btn-outline-info'>Edit</button>
                  </div>
                  <div style={{ flex:1 }}>
                    <button className='btn btn-sm btn-outline-dark delete' onClick={() => self.deleteItem(task)}>Delete</button>
                  </div>
                </div>
              )
            }) 
          }
          </div>
        </div>
      </div>
    )
  }
}

export default App;
