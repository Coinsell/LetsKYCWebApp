import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  avatar?: string;
  preferences?: {
    theme: "light" | "dark";
    language: string;
  };
}

interface AuthState {
  authUser: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AUTHUSER"; payload: AuthUser | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  authUser: null,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_AUTHUSER":
      return {
        ...state,
        authUser: action.payload,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "LOGOUT":
      return { ...state, authUser: null, isLoading: false, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authUser: AuthUser | null;
  isLoading: boolean;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        // In real app, check for existing token/session
        const savedUser = localStorage.getItem("authUser");
        if (savedUser) {
          const authUser = JSON.parse(savedUser);
          dispatch({ type: "SET_AUTHUSER", payload: authUser });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to check authentication",
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Mock login - replace with Azure AD B2C integration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data based on email
      const mockUser: AuthUser = {
        id: "1",
        email,
        firstName: email.includes("admin") ? "Admin" : "John",
        lastName: email.includes("admin") ? "User" : "Doe",
        roles: email.includes("admin") ? ["admin", "user"] : ["user"],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        preferences: {
          theme: "light",
          language: "en",
        },
      };

      localStorage.setItem("authUser", JSON.stringify(mockUser));
      dispatch({ type: "SET_AUTHUSER", payload: mockUser });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Login failed" });
    }
  };

  const logout = () => {
    localStorage.removeItem("authUser");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        authUser: state.authUser,
        isLoading: state.isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
