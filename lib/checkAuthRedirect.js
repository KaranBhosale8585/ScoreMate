import axios from "axios";

export const checkAuthRedirect = async (router, requiredRole) => {
  try {
    const res = await axios.get("/api/auth/user", { withCredentials: true });
    const user = res.data.user;

    if (!user.role) {
      router.push("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      console.log("Check")
      console.log("requiredRole:- ",requiredRole)
      console.log("userRole:- ", user.role)
        router.push("/");
      return;
    }

    if (user.role === "student") {
      console.log("Student")
      console.log("requiredRole:- ", requiredRole);
      console.log("userRole:- ", user.role);
      router.push("/");
    } else if (user.role === "examiner") {
      console.log("Admin");
      console.log("requiredRole:- ", requiredRole);
      console.log("userRole:- ", user.role);
      router.push("/dashboard");
    } else {
      console.log("Else");
      console.log("requiredRole:- ", requiredRole);
      console.log("userRole:- ", user.role);
      router.push("/");
    }
  } catch (err) {
    router.push("/login");
  }
};
