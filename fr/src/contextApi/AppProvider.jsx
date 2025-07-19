import { UserProvider } from "./UserContext.jsx";
export function AppProvider({ children }) {
    return (
        <UserProvider>
            {children}
        </UserProvider>
    );
}