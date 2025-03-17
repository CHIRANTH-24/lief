"use client"


import { createContext, useContext, useState, useEffect } from "react"



const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (email, password) => {
        setIsLoading(true)
        try {
            // Mock login
            const role = email.includes("manager") ? "manager" : "careworker"
            const user = {
                id: "user-1",
                name: email.split("@")[0],
                email,
                role,
            }
            setUser(user)
            localStorage.setItem("user", JSON.stringify(user))
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
    }

    return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

