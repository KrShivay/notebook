import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {yupResolver} from "@hookform/resolvers/yup";
import Loader from "components/loader";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {toast} from "react-toastify";
import validation from "utils/forms/validation";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "utils/fucntions/handleLocalStorage";

type Inputs = {
  email: string;
  password: string;
};

const defaultValues = {
  email: "",
  password: "",
};
export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<Inputs>({
    resolver: yupResolver(validation.loginSchema),
    defaultValues,
  });
  const {handleSubmit} = form;

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      if (getLocalStorageItem("email")) {
        router.push("/dashboard", {scroll: false});
      }
    }
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await fetch("/api/login", {
      method: "POST", // Set request method to POST
      headers: {"Content-Type": "application/json"}, // Set content type for JSON data
      body: JSON.stringify(data), // Convert form data to JSON string
    })
      .then((resp) => resp.json())
      .then((resp): void => {
        if (resp.code == 201 || resp.code == 200) {
          setLocalStorageItem("email", data.email);
          setLocalStorageItem("user", resp.data);
          toast.success(resp.message);
          setLoading(false);
          router.push("/dashboard", {scroll: false});
        } else {
          toast.error(resp.message);
          setLoading(false);
        }
      });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="m@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      {loading ? <Loader /> : null}
    </div>
  );
}
