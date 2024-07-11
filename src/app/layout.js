import "./globals.css";
import "./app.css"
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import axios from "axios";
config.autoAddCss = false

axios.defaults.withCredentials = true
export const metadata = {
  title: "Hey Bosch VA",
  description: "Virtual Assistant",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
