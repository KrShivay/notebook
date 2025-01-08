import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu, Package2, Search, User } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { toast } from "react-toastify";

export default function Navbar() {
  const { session, setSession } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('session');
      setSession(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="w-24">Invoice App</span>
        </Link>
      </nav>
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
        <Link
          href="/generate-invoice"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Invoice
        </Link>
        <Link
          href="/clients"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Clients
        </Link>
        <Link
          href="/suppliers"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Suppliers
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span>Invoice App</span>
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link
              href="/generate-invoice"
              className="text-muted-foreground hover:text-foreground"
            >
              Invoice
            </Link>
            <Link
              href="/clients"
              className="text-muted-foreground hover:text-foreground"
            >
              Clients
            </Link>
            <Link
              href="/suppliers"
              className="text-muted-foreground hover:text-foreground"
            >
              Suppliers
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/dashboard" className="flex w-full">
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/invoices" className="flex w-full">
                Invoices
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/clients" className="flex w-full">
                Clients
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/suppliers" className="flex w-full">
                Suppliers
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/generate-invoice" className="flex w-full">
                Generate Invoice
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
