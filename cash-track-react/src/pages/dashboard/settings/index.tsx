import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Lock, LogOut, Save, Eye, EyeOff, Mail, Shield, Calendar, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/useAuth"
import { useLogout } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: user } = useCurrentUser()
  const { mutate: logout } = useLogout()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleLogout = () => {
    logout()
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Veuillez remplir le champ nom")
      return
    }
    setIsSavingProfile(true)
    // Simuler une requête API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSavingProfile(false)
    toast.success("Profil mis à jour avec succès")
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères")
      return
    }
    setIsChangingPassword(true)
    // Simuler une requête API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsChangingPassword(false)
    toast.success("Mot de passe modifié avec succès")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (password.length < 6) return { strength: 1, label: "Faible", color: "bg-red-500" }
    if (password.length < 10) return { strength: 2, label: "Moyen", color: "bg-yellow-500" }
    return { strength: 3, label: "Fort", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <div className="space-y-8 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold bg-linear-to-r from-[#0B177C] to-[#0A1259] bg-clip-text text-transparent">
          Paramètres
        </h1>
        <p className="text-neutral-500 text-lg">Gérez votre compte et vos préférences</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-xl shadow-neutral-200/50 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0B177C] to-[#0A1259] flex items-center justify-center shadow-lg shadow-[#0B177C]/25">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Informations du profil</CardTitle>
                  <CardDescription className="text-sm mt-1">Mettez à jour vos informations personnelles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 p-4 bg-linear-to-r from-[#0B177C]/5 to-[#0A1259]/5 rounded-xl border border-[#0B177C]/10">
                <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                  <AvatarFallback className="bg-linear-to-br from-[#0B177C] to-[#0A1259] text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-lg text-neutral-900">{user?.name || "Utilisateur"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={
                        user?.role === "admin"
                          ? "bg-[#0B177C]/10 text-[#0B177C] border-[#0B177C]/20"
                          : "bg-neutral-100 text-neutral-700"
                      }
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user?.role === "admin" ? "Administrateur" : 
                       user?.role === "readonly" ? "Lecture seule" : 
                       "Utilisateur"}
                    </Badge>
                    {user?.status === "active" && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Actif
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0B177C]" />
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 border-neutral-200 focus:border-[#0B177C] focus:ring-[#0B177C]/20"
                    placeholder="Votre nom complet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0B177C]" />
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    className="h-12 border-neutral-200 bg-neutral-50 text-neutral-600 cursor-not-allowed"
                    placeholder="votre@email.com"
                  />
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    L'adresse email ne peut pas être modifiée
                  </p>
                </div>
              </div>

              {/* User Info Display */}
              {user?.createdAt && (
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar className="w-4 h-4" />
                    <span>Compte créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full bg-linear-to-r from-[#0B177C] to-[#0A1259] text-white h-12 text-base font-semibold hover:shadow-lg hover:shadow-[#0B177C]/25 transition-all duration-300"
              >
                {isSavingProfile ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card className="border-0 shadow-xl shadow-neutral-200/50 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/25">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Sécurité</CardTitle>
                  <CardDescription className="text-sm mt-1">Modifiez votre mot de passe pour sécuriser votre compte</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold">
                  Mot de passe actuel
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe actuel"
                    className="h-12 pr-12 border-neutral-200 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#8B5CF6] transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez votre nouveau mot de passe"
                    className="h-12 pr-12 border-neutral-200 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#8B5CF6] transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1 h-2">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500">
                      Force: <span className="font-semibold">{passwordStrength.label || "Aucune"}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="h-12 pr-12 border-neutral-200 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#8B5CF6] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    {confirmPassword === newPassword ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Les mots de passe correspondent
                      </span>
                    ) : (
                      <span className="text-red-600">Les mots de passe ne correspondent pas</span>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white hover:shadow-lg hover:shadow-[#8B5CF6]/25 transition-all duration-300"
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Modifier le mot de passe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Account Actions */}
        <div className="space-y-6">
          {/* Account Status Card */}
          <Card className="border-0 shadow-xl shadow-neutral-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Statut du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Rôle</span>
                  <Badge
                    variant="secondary"
                    className={
                      user?.role === "admin"
                        ? "bg-[#0B177C]/10 text-[#0B177C] border-[#0B177C]/20"
                        : "bg-neutral-100 text-neutral-700"
                    }
                  >
                    {user?.role === "admin" ? "Administrateur" : "Utilisateur"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Statut</span>
                  <Badge
                    variant="secondary"
                    className={
                      user?.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }
                  >
                    {user?.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                {user?.email && (
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-600 block mb-1">Email</span>
                    <span className="text-sm font-medium text-neutral-900">{user.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border-0 shadow-xl shadow-red-100/50 border-l-4 border-l-[#EF4444]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#EF4444]">Zone de danger</CardTitle>
              <CardDescription className="text-sm">Actions irréversibles sur votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <p className="font-medium text-neutral-900 mb-1">Déconnexion</p>
                  <p className="text-sm text-neutral-600 mb-4">Se déconnecter de votre compte</p>
                  <Button
                    variant="outline"
                    className="w-full text-[#EF4444] border-[#EF4444] hover:bg-[#EF4444] hover:text-white hover:shadow-lg hover:shadow-[#EF4444]/25 transition-all duration-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
