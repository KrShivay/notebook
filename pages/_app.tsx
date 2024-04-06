import {cn} from "@/lib/utils";
import {Inter as FontSans} from "next/font/google";
import {ToastContainer} from "react-toastify";

import "../styles/global.css";

interface AppProps {
  Component: React.ElementType;
  pageProps: any;
}

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function App({Component, pageProps}: AppProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background antialiased dark",
        fontSans.variable
      )}
    >
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
