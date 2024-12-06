import {cn} from "@/lib/utils";
import {Inter as FontSans} from "next/font/google";
import {ToastContainer} from "react-toastify";
import {InvoiceProvider} from "../context/InvoiceContext";
import {SessionProvider} from "../context/SessionContext";
import {FormProvider} from "../context/FormContext";
import {DataProvider} from "../context/DataContext";
import "react-toastify/dist/ReactToastify.css";
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
    <SessionProvider>
      <DataProvider>
        <FormProvider>
          <InvoiceProvider>
            <div
              className={cn(
                "min-h-screen bg-background font-sans antialiased",
                fontSans.variable
              )}
            >
              <Component {...pageProps} />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </InvoiceProvider>
        </FormProvider>
      </DataProvider>
    </SessionProvider>
  );
}
