import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/stores/app-store"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const login = useAppStore((state) => state.login)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast.success("Connexion réussie!")
        navigate("/dashboard")
      } else {
        toast.error("Identifiants incorrects")
      }
    } catch {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0B177C]/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#10B981]/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0B177C]/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#B8B8B812_1px,transparent_1px),linear-gradient(to_bottom,#B8B8B812_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo with animation */}
        <div className="flex justify-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B177C]/20 to-[#10B981]/20 rounded-3xl blur-2xl animate-pulse" />
            <img 
              src="/logo.png" 
              alt="CashTrack Logo" 
              className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Login Card with enhanced design */}
        <Card className="border-0 shadow-2xl shadow-[#0B177C]/10 bg-white/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="space-y-3 pb-8 pt-8">
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#0B177C] via-[#0B177C] to-[#0A1259] bg-clip-text text-transparent">
                Bienvenue
              </CardTitle>
              <CardDescription className="text-base" style={{ color: '#B8B8B8' }}>
                Connectez-vous pour accéder à votre espace de gestion
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">
                  Adresse email
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B177C]/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 group-focus-within:text-[#0B177C] transition-colors z-10 pointer-events-none" style={{ color: '#B8B8B8' }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-neutral-50/50 border-2 focus:bg-white focus:border-[#0B177C] focus:ring-2 focus:ring-[#0B177C]/20 transition-all duration-300 text-base relative z-20"
                    style={{ borderColor: '#B8B8B8' }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-neutral-700">
                    Mot de passe
                  </Label>
                  <Link 
                    to="/auth/forgot-password" 
                    className="text-sm text-[#0B177C] hover:text-[#0A1259] font-medium transition-colors underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B177C]/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 group-focus-within:text-[#0B177C] transition-colors z-10 pointer-events-none" style={{ color: '#B8B8B8' }} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-neutral-50/50 border-2 focus:bg-white focus:border-[#0B177C] focus:ring-2 focus:ring-[#0B177C]/20 transition-all duration-300 text-base relative z-20"
                    style={{ borderColor: '#B8B8B8' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[#0B177C] transition-colors z-30 p-1 rounded-md hover:bg-neutral-100"
                    style={{ color: '#B8B8B8' }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-[#0B177C] to-[#0A1259] hover:from-[#0A1259] hover:to-[#0B177C] text-white font-semibold text-base shadow-xl shadow-[#0B177C]/30 hover:shadow-[#0B177C]/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connexion en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Se connecter</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer text */}
        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-300">
          <p className="text-sm" style={{ color: '#B8B8B8' }}>
            Système de gestion de caisse sécurisé
          </p>
        </div>
      </div>
    </div>
  )
}
