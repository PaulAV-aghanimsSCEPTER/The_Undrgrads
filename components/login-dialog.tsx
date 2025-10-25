"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { generateToken } from "@/lib/jwt"

interface LoginDialogProps {
  onLogin: (token: string) => void
}

export default function LoginDialog({ onLogin }: LoginDialogProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    // Simple validation - one account only
    if (username === "Maynard" && password === "benzaralihd1st") {
      const token = generateToken(username)
      localStorage.setItem("authToken", token)
      onLogin(token)
    } else {
      setError("Invalid credentials. Please try again.")
      setPassword("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">The Undergrads</h1>
          <p className="text-gray-600">Order Management System</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <Input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError("")
              }}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              placeholder="**************"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

          <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2">
            Login
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Login Credentials</p>
          <p>
            Username: <span className="font-mono">Adminname</span>
          </p>
          <p>
            Password: <span className="font-mono">Pledgename</span>
          </p>
        </div>
      </Card>
    </div>
  )
}
