import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Login from "./Login";
import Signup from "./Signup";

const Auth = () => {
  return (
    <Tabs defaultValue="login" className="w-200 mx-auto mt-20">
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
