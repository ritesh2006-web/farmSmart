// Skeleton — fill in the blanks:
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [user, setUser] = useState(
        // read from localStorage on first load
        () => {
            const savedUser = localStorage.getItem('user')
            try {
                return savedUser ? JSON.parse(savedUser) : null
            } catch (e) {
                return null
            }
        }
    )
    const [token, setToken] = useState(
        // read from localStorage on first load
        () => {
            const savedToken = localStorage.getItem('token')
            return savedToken || null
        }
    )

    const login = (newToken, newUser) => {
        // save to state + localStorage
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        setIsAuthenticated(true);

    }

    const logout = () => {
        // clear state + localStorage
        setToken(null);
        setUser(null);
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        setIsAuthenticated(false)

    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)