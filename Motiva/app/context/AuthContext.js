import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([
        {
            username: 'thiagoalvarenga',
            password: '562695'
        },
        {
            username: 'israelkaracsony',
            password: '563435'
        }
    ]);

    useEffect(() => {
        loadUser()
    }, []);

    async function loadUser() {
        try {
            const userJson = await AsyncStorage.getItem('user')
            if (userJson) {
                setUser(JSON.parse(userJson))
            }
        } catch (error) {
            console.error('Erro ao carregar usuário', error)
        }
    }

    async function saveUser(user) {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(user));
            setUser(user)
        } catch (error) {
            console.error('Erro ao salvar usuário', error);
        }
    }

    async function auth(userTyped, passwordTyped) {
        const userFormatted = userTyped.trim().toLowerCase();

        const userFound = users.find (
            (user) => user.username.toLowerCase() === userFormatted
        );
        if (!userFound) {
            return 'user';
        }

        if(userFound.password !== passwordTyped) {
            return 'password';
        }

        await saveUser(userFound);
        return true;
    }

    function logout() {
        setUser(null);
        AsyncStorage.removeItem('user');
    }

    return (
        <AuthContext.Provider value={{ user, auth, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);

}

export default AuthProvider