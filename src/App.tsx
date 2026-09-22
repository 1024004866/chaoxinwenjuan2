import { RouterProvider } from 'react-router-dom'
import routerConfig from './router'
import 'antd/dist/reset.css'
import './App.css'
// import List from './pages/List'
function App() {
  // return (
  //   // <div className="App">
  //   //   <h1 style={{ padding: '26px', background: 'yellow' }}>问卷 FE</h1>
  //   //   <List />
  //   // </div>

  // )
  return <RouterProvider router={routerConfig} />
}

export default App
