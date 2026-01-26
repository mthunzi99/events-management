import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import Login from "./login";
import Signup from "./signup";

const Auth = () => {
  return (
    <Tabs defaultValue="login">
      <TabsList className="w-full justify-center mb-4">
        <TabsTrigger className="w-1/2" value="login">
          Login
        </TabsTrigger>
        <TabsTrigger className="w-1/2" value="signup">
          Sign Up
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Login />
      </TabsContent>
      <TabsContent value="signup">
        <Signup />
      </TabsContent>
    </Tabs>
  );
};

export default Auth;
