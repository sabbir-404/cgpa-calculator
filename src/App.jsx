import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import Calculator from "./components/Calculator";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="container">
            <Calculator />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
