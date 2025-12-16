import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserCircle,
  Mail,
  Shield,
  Calendar,
  AlertTriangle,
  Filter,
  X,
  Key,
  Power,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KPICard } from "@/components/kpi-card"
import { Pagination } from "@/components/pagination"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useChangePassword, useToggleUserStatus } from "@/hooks/useUser"
import { useCurrentUser } from "@/hooks/useAuth"
import type { User } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export default function UsersPage() {
  const navigate = useNavigate()
  const { data: usersData } = useUsers()
  const { data: currentUser } = useCurrentUser()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const changePasswordMutation = useChangePassword()
  const toggleStatusMutation = useToggleUserStatus()
  
  const users = usersData?.data || []
  const isAdmin = currentUser?.role === "admin"
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "user" as "admin" | "user" | "readonly",
    status: "active" as "active" | "inactive",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (currentUser && !isAdmin) {
      navigate("/dashboard")
    }
  }, [currentUser, isAdmin, navigate])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (roleFilter !== "all") count++
    if (statusFilter !== "all") count++
    return count
  }, [roleFilter, statusFilter])

  const clearFilters = () => {
    setRoleFilter("all")
    setStatusFilter("all")
    setSearchQuery("")
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [filteredUsers, currentPage, itemsPerPage])
  
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, statusFilter])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">Accès refusé</h2>
              <p className="text-neutral-500">
                Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page. Seuls les administrateurs
                peuvent gérer les utilisateurs.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-[#0B177C] to-[#0A1259] hover:from-[#0A1259] hover:to-[#0B177C] text-white"
              >
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      if (user.isSuperuser) {
        toast.error("Le compte superadmin ne peut pas être modifié")
        return
      }
      setEditingUser(user)
      setFormData({
        email: user.email,
        name: user.name || "",
        password: "", // Password not needed for editing
        role: user.role || "user",
        status: user.status || "active",
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: "",
        name: "",
        password: "",
        role: "user",
        status: "active",
      })
    }
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Veuillez entrer une adresse email valide"
    }

    if (!editingUser) {
      if (!formData.password || formData.password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (editingUser) {
      // Remove password from update data (password is changed separately)
      const { password, ...updateData } = formData
      updateMutation.mutate({
        userId: editingUser.id,
        data: updateData,
      })
    } else {
      createMutation.mutate(formData)
    }

    handleCloseModal()
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" })
    }
  }

  const handleDeleteClick = (user: User) => {
    if (user.isSuperuser) {
      toast.error("Le compte superadmin ne peut pas être supprimé")
      return
    }
    if (user.id === currentUser?.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte")
      return
    }
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id)
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }

  const handleOpenPasswordModal = (user: User) => {
    if (user.isSuperuser) {
      toast.error("Le mot de passe du compte superadmin ne peut pas être modifié")
      return
    }
    setSelectedUserForPassword(user)
    setNewPassword("")
    setConfirmPassword("")
    setPasswordErrors({})
    setIsPasswordModalOpen(true)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForPassword) return

    const errors: Record<string, string> = {}

    if (newPassword.length < 8) {
      errors.newPassword = "Le mot de passe doit contenir au moins 8 caractères"
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setPasswordErrors({})
    changePasswordMutation.mutate({
      userId: selectedUserForPassword.id,
      password: newPassword,
    })
    setIsPasswordModalOpen(false)
    setNewPassword("")
    setConfirmPassword("")
    setSelectedUserForPassword(null)
  }

  const handleToggleStatus = (user: User) => {
    if (user.isSuperuser) {
      toast.error("Le statut du compte superadmin ne peut pas être modifié")
      return
    }
    if (user.id === currentUser?.id) {
      toast.error("Vous ne pouvez pas vous désactiver vous-même")
      return
    }
    toggleStatusMutation.mutate(user.id)
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700"
      case "readonly":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-neutral-100 text-neutral-700"
    }
  }

  const getStatusBadgeColor = (status?: string) => {
    return status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
  }

  const getRoleDescription = (role?: string) => {
    switch (role) {
      case "admin":
        return "Accès complet au système"
      case "readonly":
        return "Lecture seule - Consultation uniquement"
      default:
        return "Opérations de caisse"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestion des Utilisateurs</h1>
          <p className="text-neutral-500 mt-1">Gérez les utilisateurs et leurs permissions d&apos;accès au système</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#0B177C] to-[#0A1259] hover:from-[#0A1259] hover:to-[#0B177C] text-white shadow-lg shadow-[#0B177C]/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Utilisateurs"
          value={users.length}
          icon={UserCircle}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          valueColor="text-neutral-900"
          className="bg-gradient-to-br from-white to-blue-50/30"
        />
        
        <KPICard
          title="Actifs"
          value={users.filter((u) => u.status === "active").length}
          icon={Shield}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#10B981] to-[#059669]"
          valueColor="text-neutral-900"
          className="bg-gradient-to-br from-white to-green-50/30"
        />
        
        <KPICard
          title="Admins"
          value={users.filter((u) => u.role === "admin").length}
          icon={Shield}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"
          valueColor="text-neutral-900"
          className="bg-gradient-to-br from-white to-purple-50/30"
        />
      </div>

      {/* Search & Filters Section */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-50 border-neutral-200 focus:border-[#0B177C] focus:ring-[#0B177C]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${showFilters ? "bg-[#0B177C] text-white hover:bg-[#0A1259]" : ""}`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 bg-white text-[#0B177C] hover:bg-white">{activeFiltersCount}</Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-neutral-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Rôle</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-neutral-50">
                    <SelectValue placeholder="Tous les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="readonly">Lecture seule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-neutral-50">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="ghost" onClick={clearFilters} className="text-neutral-500 hover:text-neutral-700">
                  <X className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(activeFiltersCount > 0 || searchQuery) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                Recherche: {searchQuery}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {roleFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                Rôle: {
                  roleFilter === "admin" ? "Administrateur" : 
                  roleFilter === "readonly" ? "Lecture seule" : 
                  "Utilisateur"
                }
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setRoleFilter("all")} />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                Statut: {statusFilter === "active" ? "Actif" : "Inactif"}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setStatusFilter("all")} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Utilisateur</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Rôle</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Date création</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B177C] to-[#0A1259] flex items-center justify-center text-white font-semibold">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{user.name || "Sans nom"}</p>
                        <p className="text-xs text-neutral-400">{getRoleDescription(user.role)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role === "admin" ? "Administrateur" : 
                       user.role === "readonly" ? "Lecture seule" : 
                       "Utilisateur"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}
                    >
                      {user.status === "active" ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{user.createdAt || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.isSuperuser && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 mr-2">
                          <Shield className="w-3 h-3 mr-1" />
                          Superadmin
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenPasswordModal(user)}
                        disabled={user.isSuperuser}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.isSuperuser ? "Le mot de passe du superadmin ne peut pas être modifié" : "Changer le mot de passe"}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(user)}
                        disabled={user.isSuperuser || user.id === currentUser?.id}
                        className={`${
                          user.status === "active"
                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                            : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={
                          user.isSuperuser 
                            ? "Le statut du superadmin ne peut pas être modifié" 
                            : user.id === currentUser?.id
                            ? "Vous ne pouvez pas vous désactiver vous-même"
                            : user.status === "active" 
                            ? "Désactiver" 
                            : "Activer"
                        }
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(user)}
                        disabled={user.isSuperuser}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.isSuperuser ? "Le superadmin ne peut pas être modifié" : "Modifier"}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(user)}
                        disabled={user.isSuperuser || user.id === currentUser?.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          user.isSuperuser 
                            ? "Le superadmin ne peut pas être supprimé" 
                            : user.id === currentUser?.id
                            ? "Vous ne pouvez pas supprimer votre propre compte"
                            : "Supprimer"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">Aucun utilisateur trouvé</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showPageInput={totalPages > 10}
        />
      </div>

      {/* User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Modifiez les informations de l'utilisateur" : "Ajoutez un nouvel utilisateur au système"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="email@example.com"
                  required
                  disabled={!!editingUser}
                  className={formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
              {formErrors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.email}
                </p>
              )}
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required={!editingUser}
                    minLength={8}
                    className={`pr-10 ${formErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  {formErrors.password && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                  {formData.password.length >= 8 && !formErrors.password && formData.password.length > 0 && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.password}
                  </p>
                )}
                {formData.password.length > 0 && formData.password.length < 8 && !formErrors.password && (
                  <p className="text-sm text-neutral-500">
                    {formData.password.length}/8 caractères minimum
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2 text-sm">
                <Shield className="w-3.5 h-3.5" />
                Rôle <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: "user" })
                    if (formErrors.role) {
                      setFormErrors({ ...formErrors, role: "" })
                    }
                  }}
                  className={`p-2.5 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    formData.role === "user"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  } ${formErrors.role ? "border-red-500" : ""}`}
                >
                  <UserCircle className={`w-4 h-4 shrink-0 ${formData.role === "user" ? "text-blue-500" : "text-neutral-400"}`} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-xs">Utilisateur</span>
                    <span className="text-[10px] opacity-70 truncate w-full">Opérations</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: "admin" })
                    if (formErrors.role) {
                      setFormErrors({ ...formErrors, role: "" })
                    }
                  }}
                  className={`p-2.5 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    formData.role === "admin"
                      ? "border-purple-500 bg-purple-500/10 text-purple-600 shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  } ${formErrors.role ? "border-red-500" : ""}`}
                >
                  <Shield className={`w-4 h-4 shrink-0 ${formData.role === "admin" ? "text-purple-500" : "text-neutral-400"}`} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-xs">Admin</span>
                    <span className="text-[10px] opacity-70 truncate w-full">Accès complet</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: "readonly" })
                    if (formErrors.role) {
                      setFormErrors({ ...formErrors, role: "" })
                    }
                  }}
                  className={`p-2.5 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    formData.role === "readonly"
                      ? "border-neutral-500 bg-neutral-500/10 text-neutral-700 shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  } ${formErrors.role ? "border-red-500" : ""}`}
                >
                  <Lock className={`w-4 h-4 shrink-0 ${formData.role === "readonly" ? "text-neutral-600" : "text-neutral-400"}`} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-xs">Lecture seule</span>
                    <span className="text-[10px] opacity-70 truncate w-full">Consultation</span>
                  </div>
                </button>
              </div>
              {formErrors.role && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.role}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-2 text-sm">
                <Power className="w-3.5 h-3.5" />
                Statut <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, status: "active" })
                    if (formErrors.status) {
                      setFormErrors({ ...formErrors, status: "" })
                    }
                  }}
                  className={`p-2.5 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    formData.status === "active"
                      ? "border-green-500 bg-green-500/10 text-green-600 shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  } ${formErrors.status ? "border-red-500" : ""}`}
                >
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${formData.status === "active" ? "text-green-500" : "text-neutral-400"}`} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-xs">Actif</span>
                    <span className="text-[10px] opacity-70 truncate w-full">Peut se connecter</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, status: "inactive" })
                    if (formErrors.status) {
                      setFormErrors({ ...formErrors, status: "" })
                    }
                  }}
                  className={`p-2.5 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    formData.status === "inactive"
                      ? "border-orange-500 bg-orange-500/10 text-orange-600 shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  } ${formErrors.status ? "border-red-500" : ""}`}
                >
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${formData.status === "inactive" ? "text-orange-500" : "text-neutral-400"}`} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-xs">Inactif</span>
                    <span className="text-[10px] opacity-70 truncate w-full">Ne peut pas se connecter</span>
                  </div>
                </button>
              </div>
              {formErrors.status && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.status}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-[#0B177C] to-[#0A1259] hover:from-[#0A1259] hover:to-[#0B177C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingUser ? "Mise à jour..." : "Création..."}
                  </>
                ) : (
                  editingUser ? "Mettre à jour" : "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Modifiez le mot de passe de {selectedUserForPassword?.name || selectedUserForPassword?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (passwordErrors.newPassword) {
                      setPasswordErrors({ ...passwordErrors, newPassword: "" })
                    }
                  }}
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  className={`pr-10 ${passwordErrors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {passwordErrors.newPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
                {newPassword.length >= 8 && !passwordErrors.newPassword && newPassword.length > 0 && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordErrors.newPassword}
                </p>
              )}
              {newPassword.length > 0 && newPassword.length < 8 && !passwordErrors.newPassword && (
                <p className="text-sm text-neutral-500">
                  {newPassword.length}/8 caractères minimum
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors({ ...passwordErrors, confirmPassword: "" })
                    }
                  }}
                  placeholder="Répétez le mot de passe"
                  required
                  minLength={8}
                  className={`pr-10 ${passwordErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {passwordErrors.confirmPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
                {confirmPassword.length > 0 && newPassword === confirmPassword && !passwordErrors.confirmPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordErrors.confirmPassword}
                </p>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && !passwordErrors.confirmPassword && (
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#0B177C] to-[#0A1259] hover:from-[#0A1259] hover:to-[#0B177C]"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Modification..." : "Modifier le mot de passe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
                <DialogDescription className="mt-1">
                  Cette action est irréversible
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-neutral-700 mb-4">
              Êtes-vous sûr de vouloir supprimer l&apos;utilisateur{" "}
              <span className="font-semibold text-neutral-900">
                {userToDelete?.name || userToDelete?.email}
              </span>
              ?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Attention :</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    <li>Toutes les données associées à cet utilisateur seront perdues</li>
                    <li>L&apos;utilisateur ne pourra plus se connecter au système</li>
                    <li>Cette action ne peut pas être annulée</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDelete}
              disabled={deleteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
