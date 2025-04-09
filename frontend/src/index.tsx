import { createRoot } from "react-dom/client";
import App from "./App";

const element = document.querySelector("#root");

if (element) {
  const root = createRoot(element);
  root.render(<App />);
}