import ReactDOM from "react-dom/client";
import PopupApp from "./PopupApp";
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<PopupApp />);
}
